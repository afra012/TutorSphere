import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import TutorCard from "./components/TutorCard/TutorCard";
import "./FindTutor.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

/*
|--------------------------------------------------------------------------
| AUTH TOKEN
|--------------------------------------------------------------------------
*/

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("auth_token") ||
  "";

const getAuthConfig = () => {
  const token = getToken();

  return {
    headers: {
      Accept: "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
};

/*
|--------------------------------------------------------------------------
| NORMALIZE TUTOR
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| id               = users.id
| teacherProfileId = teacher_profiles.id
|
| Tutor profile page uses users.id.
| Tuition request uses teacher_profiles.id.
|
*/

function normalizeTutor(raw) {
  const subjects = Array.isArray(raw.subjects)
    ? raw.subjects
    : [];

  return {
    id: raw.teacher_id,

    // VERY IMPORTANT
    teacherProfileId:
      raw.teacher_profile_id,

    name: raw.name,

    avatarUrl:
      raw.profile_picture,

    subject:
      subjects[0] || "",

    subjects,

    tags: subjects,


    location:
      raw.location,

    mode:
      raw.tutoring_mode,

    price:
      raw.hourly_rate != null
        ? Number(raw.hourly_rate)
        : null,


    location: raw.location,
    gender: raw.gender,
    mode: raw.tutoring_mode,
    price: raw.hourly_rate != null ? Number(raw.hourly_rate) : null,

    priceUnit: "hour",

    rating:
      raw.rating,

    reviewsCount:
      raw.review_count,

    experienceYears:
      raw.teaching_experience,

    verified: false,
  };
}

/*
|--------------------------------------------------------------------------
| FILTERS
|--------------------------------------------------------------------------
*/

const initialFilters = {
  subject: "",
  location: "",
  mode: "",
  price: "",
  gender: "",
};

const genderOptions = [
  { value: "", label: "Any gender" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const priceRanges = [
  {
    value: "",
    label: "Any price",
  },
  {
    value: "0-1000",
    label: "৳0 - ৳1000 / hr",
  },
  {
    value: "1000-2000",
    label: "৳1000 - ৳2000 / hr",
  },
  {
    value: "2000-3000",
    label: "৳2000 - ৳3000 / hr",
  },
  {
    value: "3000+",
    label: "৳3000+ / hr",
  },
];

const sortOptions = [
  {
    value: "recommended",
    label: "Recommended",
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
  },
  {
    value: "rating-desc",
    label: "Highest Rated",
  },
];

/*
|--------------------------------------------------------------------------
| SEARCH ICON
|--------------------------------------------------------------------------
*/

function SearchIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  );
}

/*
|--------------------------------------------------------------------------
| FIELD ICON
|--------------------------------------------------------------------------
*/

function FieldIcon({
  children,
}) {
  return (
    <span className="ft-field-icon">
      {children}
    </span>
  );
}


/*
|--------------------------------------------------------------------------
| PRICE RANGE
|--------------------------------------------------------------------------
*/

function matchesPriceRange(
  price,
  range
) {
  if (!range) {
    return true;
  }

  if (price == null) {
    return false;
  }

  if (range === "3000+") {
    return price >= 3000;
  }

  const [min, max] =
    range
      .split("-")
      .map(Number);

  if (range === "3000+") return price >= 3000;


  return (
    price >= min &&
    price <= max
  );
}

/*
|--------------------------------------------------------------------------
| FIND TUTOR PAGE
|--------------------------------------------------------------------------
*/

export default function FindTutor() {
  const navigate =
    useNavigate();

  const [tutors, setTutors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    allSubjects,
    setAllSubjects,
  ] = useState([]);

  const [
    filters,
    setFilters,
  ] =
    useState(initialFilters);

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState(initialFilters);

  const [sortBy, setSortBy] =
    useState("recommended");

  const [
    favorites,
    setFavorites,
  ] =
    useState([]);

  /*
  |--------------------------------------------------------------------------
  | REQUEST STATUS
  |--------------------------------------------------------------------------
  |
  | idle      = Request
  | sending   = Sending...
  | requested = Requested
  | accepted  = Accepted
  |
  */

  const [
    requestStatusById,
    setRequestStatusById,
  ] =
    useState({});

  const [toast, setToast] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | TOAST
  |--------------------------------------------------------------------------
  */

  const showToast = (
    type,
    message
  ) => {
    setToast({
      type,
      message,
    });
  };

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer =
      setTimeout(
        () => {
          setToast(null);
        },
        4000
      );

    return () =>
      clearTimeout(timer);

  }, [toast]);

  /*
  |--------------------------------------------------------------------------
  | GET STUDENT'S OWN REQUEST STATUS
  |--------------------------------------------------------------------------
  |
  | Backend:
  |
  | pending  -> Requested
  | accepted -> Accepted
  | rejected -> Request
  |
  */

  const fetchMyRequests =
    async () => {

      try {

        const response =
          await axios.get(
            `${API_BASE_URL}/my-tuition-requests`,
            getAuthConfig()
          );

        const requests =
          Array.isArray(
            response.data?.requests
          )
            ? response.data.requests
            : [];

        /*
        ----------------------------------------------------------
        Backend returns newest requests first.

        Same teacher may have:

        old rejected
        new pending

        So only latest request for each teacher
        should control the button.
        ----------------------------------------------------------
        */

        const latestStatusByTeacher =
          {};

        requests.forEach(
          (request) => {

            const teacherProfileId =
              Number(
                request.teacher_profile_id
              );

            if (!teacherProfileId) {
              return;
            }

            /*
            Already processed this teacher.
            Since newest is first, ignore older history.
            */

            if (
              latestStatusByTeacher[
                teacherProfileId
              ] !== undefined
            ) {
              return;
            }

            const status =
              String(
                request.status || ""
              ).toLowerCase();

            /*
            pending
            */

            if (
              status === "pending"
            ) {

              latestStatusByTeacher[
                teacherProfileId
              ] = "requested";

              return;
            }

            /*
            accepted
            */

            if (
              status === "accepted"
            ) {

              latestStatusByTeacher[
                teacherProfileId
              ] = "accepted";

              return;
            }

            /*
            rejected

            Student can request again.
            */

            if (
              status === "rejected"
            ) {

              latestStatusByTeacher[
                teacherProfileId
              ] = "idle";

              return;
            }

            /*
            Anything else
            */

            latestStatusByTeacher[
              teacherProfileId
            ] = "idle";
          }
        );

        setRequestStatusById(
          latestStatusByTeacher
        );

      } catch (err) {

        console.error(
          "Failed to load request status:",
          err
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | SUBJECTS
  |--------------------------------------------------------------------------
  */

  const fetchSubjects =
    async () => {

      try {

        const response =
          await axios.get(
            `${API_BASE_URL}/subjects`,
            getAuthConfig()
          );

        const subjectList =
          Array.isArray(
            response.data?.subjects
          )
            ? response.data.subjects
            : [];

        setAllSubjects(
          subjectList
            .map(
              (subject) =>
                subject.subject_name
            )
            .filter(Boolean)
        );

      } catch (err) {

        console.error(
          "Failed to load subjects:",
          err
        );

        setAllSubjects([]);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | FETCH TUTORS
  |--------------------------------------------------------------------------
  */

  const fetchTutors =
    async () => {

      setLoading(true);

      setError("");

      try {

        const response =
          await axios.get(
            `${API_BASE_URL}/find-tutor`,
            getAuthConfig()
          );

        const rawTutors =
          Array.isArray(
            response.data?.tutors
          )
            ? response.data.tutors
            : [];

        setTutors(
          rawTutors.map(
            normalizeTutor
          )
        );

      } catch (err) {

        console.error(
          "Failed to load tutors:",
          err
        );

        setTutors([]);

        setError(
          "Unable to load tutors right now. Please try again."
        );

      } finally {

        setLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    fetchTutors();

    fetchSubjects();

    fetchMyRequests();

  }, []);

  /*
  |--------------------------------------------------------------------------
  | REFRESH REQUEST STATUS WHEN STUDENT COMES BACK TO TAB
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | Student sends request
  | Teacher accepts from another browser/tab
  | Student comes back
  | Status automatically becomes Accepted
  |
  */

  useEffect(() => {

    const handleWindowFocus =
      () => {
        fetchMyRequests();
      };

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };

  }, []);

  /*
  |--------------------------------------------------------------------------
  | SUBJECT OPTIONS
  |--------------------------------------------------------------------------
  */

  const subjectOptions =
    allSubjects;

  /*
  |--------------------------------------------------------------------------
  | UPDATE FILTER
  |--------------------------------------------------------------------------
  */

  const updateFilter =
    (event) => {

      const {
        name,
        value,
      } =
        event.target;

      setFilters(
        (current) => ({
          ...current,
          [name]: value,
        })
      );
    };

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const handleSearch =
    (event) => {

      event.preventDefault();

      setAppliedFilters(
        filters
      );
    };

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const handleReset =
    () => {

      setFilters(
        initialFilters
      );

      setAppliedFilters(
        initialFilters
      );
    };

  /*
  |--------------------------------------------------------------------------
  | FILTER TUTORS
  |--------------------------------------------------------------------------
  */

  const filteredTutors =
    useMemo(() => {

      return tutors.filter(
        (tutor) => {

          const matchesSubject =
            !appliedFilters.subject ||
            (
              tutor.subjects || []
            ).some(
              (subject) =>
                subject
                  ?.toLowerCase() ===
                appliedFilters
                  .subject
                  .toLowerCase()
            );

          const matchesLocation =
            !appliedFilters.location ||
            tutor.location
              ?.toLowerCase()
              .includes(
                appliedFilters
                  .location
                  .toLowerCase()
              );

          const matchesMode =
            !appliedFilters.mode ||
            tutor.mode
              ?.toLowerCase() ===
              appliedFilters
                .mode
                .toLowerCase() ||
            tutor.mode
              ?.toLowerCase() ===
              "both";

          const matchesPrice =
            matchesPriceRange(
              tutor.price,
              appliedFilters.price
            );

          return (
            matchesSubject &&
            matchesLocation &&
            matchesMode &&
            matchesPrice
          );
        }
      );

    }, [
      tutors,
      appliedFilters,
    ]);

  /*
  |--------------------------------------------------------------------------
  | SORT TUTORS
  |--------------------------------------------------------------------------
  */

  const sortedTutors =
    useMemo(() => {

      const list = [
        ...filteredTutors,
      ];

      if (
        sortBy ===
        "price-asc"
      ) {

        list.sort(
          (a, b) =>
            (a.price ??
              Infinity) -
            (b.price ??
              Infinity)
        );

      } else if (
        sortBy ===
        "price-desc"
      ) {

        list.sort(
          (a, b) =>
            (b.price ??
              -Infinity) -
            (a.price ??
              -Infinity)
        );

      } else if (
        sortBy ===
        "rating-desc"
      ) {

        list.sort(
          (a, b) =>
            (b.rating ?? 0) -
            (a.rating ?? 0)
        );
      }

      return list;

    }, [
      filteredTutors,
      sortBy,
    ]);

  /*
  |--------------------------------------------------------------------------
  | FAVORITE
  |--------------------------------------------------------------------------
  */

  const toggleFavorite =
    (tutor) => {

      setFavorites(
        (current) =>
          current.includes(
            tutor.id
          )
            ? current.filter(
                (id) =>
                  id !== tutor.id
              )
            : [
                ...current,
                tutor.id,
              ]
      );
    };


  /*
  |--------------------------------------------------------------------------
  | VIEW PROFILE
  |--------------------------------------------------------------------------
  */

      const matchesGender =
        !appliedFilters.gender ||
        tutor.gender?.toLowerCase() === appliedFilters.gender.toLowerCase();

      return matchesSubject && matchesLocation && matchesMode && matchesPrice && matchesGender;
    });
  }, [tutors, appliedFilters]);

  const handleViewProfile =
    (tutor) => {

      navigate(
        `/tutor-profile/${tutor.id}`
      );
    };

  /*
  |--------------------------------------------------------------------------
  | SEND TUTOR REQUEST
  |--------------------------------------------------------------------------
  */

  const handleRequest =
    async (tutor) => {

      if (!tutor) {
        return;
      }

      /*
      Need teacher_profiles.id
      */

      if (
        !tutor.teacherProfileId
      ) {

        showToast(
          "error",
          "Teacher profile is not available."
        );

        return;
      }

      const currentStatus =
        requestStatusById[
          tutor.teacherProfileId
        ] || "idle";

      /*
      ----------------------------------------------------------
      Do not allow another request if:

      sending
      pending/requested
      accepted
      ----------------------------------------------------------
      */

      if (
        currentStatus ===
          "sending" ||
        currentStatus ===
          "requested" ||
        currentStatus ===
          "accepted"
      ) {

        return;
      }

      /*
      Sending state
      */

      setRequestStatusById(
        (current) => ({
          ...current,

          [tutor.teacherProfileId]:
            "sending",
        })
      );

      try {

        /*
        ----------------------------------------------------------
        NEW CORRECT ENDPOINT
        ----------------------------------------------------------
        */

        await axios.post(
          `${API_BASE_URL}/tuition-requests`,

          {
            teacher_profile_id:
              tutor.teacherProfileId,
          },

          getAuthConfig()
        );

        /*
        Request created as pending.
        */

        setRequestStatusById(
          (current) => ({
            ...current,

            [tutor.teacherProfileId]:
              "requested",
          })
        );

        showToast(
          "success",
          `Request sent to ${
            tutor.name ||
            "the tutor"
          }.`
        );

      } catch (err) {

        const statusCode =
          err.response?.status;

        const serverMessage =
          err.response?.data
            ?.message;

        /*
        ----------------------------------------------------------
        Backend says active request already exists.

        Reload actual status.

        Example:
        accepted → Accepted
        pending  → Requested
        ----------------------------------------------------------
        */

        if (
          statusCode === 422
        ) {

          await fetchMyRequests();

          showToast(
            "info",
            serverMessage ||
              "You already have an active request with this tutor."
          );

        } else {

          setRequestStatusById(
            (current) => ({
              ...current,

              [tutor.teacherProfileId]:
                "idle",
            })
          );

          showToast(
            "error",
            serverMessage ||
              "Could not send the request. Please try again."
          );
        }

        console.error(
          "Tutor request error:",
          err
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <main className="find-tutor-page">

      <DashboardSidebar />

      <section className="find-tutor-content">

        {/* PAGE TITLE */}

        <div className="find-tutor-heading">

          <h1>
            Find the{" "}
            <span>
              Perfect Tutor
            </span>
          </h1>

          <p>
            Search and connect
            with the best tutors
            for your learning needs.
          </p>

        </div>

        {/* SEARCH BAR */}

        <form
          className="tutor-search-bar"
          onSubmit={
            handleSearch
          }
        >

          {/* SUBJECT */}

          <label className="tutor-search-field">

            <span className="ft-label">
              Subject
            </span>

            <span className="ft-input-wrap">

              <FieldIcon>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />

                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                </svg>

              </FieldIcon>

              <select
                name="subject"
                value={
                  filters.subject
                }
                onChange={
                  updateFilter
                }
              >

                <option value="">
                  Select subject
                </option>

                {subjectOptions.map(
                  (subject) => (

                    <option
                      key={
                        subject
                      }
                      value={
                        subject
                      }
                    >
                      {subject}
                    </option>

                  )
                )}

              </select>

            </span>

          </label>

          {/* LOCATION */}

          <label className="tutor-search-field">

            <span className="ft-label">
              Location
            </span>

            <span className="ft-input-wrap">

              <FieldIcon>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                </svg>

              </FieldIcon>

              <input
                name="location"
                value={
                  filters.location
                }
                onChange={
                  updateFilter
                }
                placeholder="Enter city or area"
                type="text"
              />

            </span>

          </label>

          {/* MODE */}

          <label className="tutor-search-field">

            <span className="ft-label">
              Mode of Tutoring
            </span>

            <span className="ft-input-wrap">

              <FieldIcon>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="13"
                    rx="2"
                  />

                  <path d="M8 21h8M12 17v4" />
                </svg>

              </FieldIcon>

              <select
                name="mode"
                value={
                  filters.mode
                }
                onChange={
                  updateFilter
                }
              >

                <option value="">
                  Any mode
                </option>

                <option value="online">
                  Online
                </option>

                <option value="In-Person">
                  In-Person
                </option>

                <option value="both">
                  Both
                </option>

              </select>

            </span>

          </label>

          {/* PRICE */}

          <label className="tutor-search-field">

            <span className="ft-label">
              Price
            </span>

            <span className="ft-input-wrap">

              <FieldIcon>
                <span className="ft-price-symbol">
                  $
                </span>
              </FieldIcon>

              <select
                name="price"
                value={
                  filters.price
                }
                onChange={
                  updateFilter
                }
              >

                {priceRanges.map(
                  (range) => (

                    <option
                      key={
                        range.value
                      }
                      value={
                        range.value
                      }
                    >
                      {range.label}
                    </option>

                  )
                )}

              </select>

            </span>

          </label>


          {/* SEARCH BUTTON */}

          <button
            type="submit"
            className="tutor-search-button"
          >


          <label className="tutor-search-field">
            <span className="ft-label">Gender</span>
            <span className="ft-input-wrap">
              <FieldIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </FieldIcon>
              <select name="gender" value={filters.gender} onChange={updateFilter}>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <button type="submit" className="tutor-search-button">

            <SearchIcon className="ft-search-icon" />

            Search Tutors

          </button>

        </form>

        {/* RESULTS HEADER */}

        <div className="tutor-results-header">

          <p className="tutor-results-count">

            {loading
              ? "Searching tutors…"
              : `${sortedTutors.length} Tutor${
                  sortedTutors.length === 1
                    ? ""
                    : "s"
                } found`}

          </p>

          <label className="tutor-sort">

            Sort by

            <select
              value={
                sortBy
              }
              onChange={(
                event
              ) =>
                setSortBy(
                  event.target.value
                )
              }
            >

              {sortOptions.map(
                (option) => (

                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>

                )
              )}

            </select>

          </label>

        </div>

        {/* TOAST */}

        {toast && (

          <div
            className={`tutor-toast tutor-toast-${toast.type}`}
            role="status"
          >
            {toast.message}
          </div>

        )}

        {/* LOADING */}

        {loading && (

          <div className="tutor-results-status">

            <p>
              Loading tutors…
            </p>

          </div>

        )}


        {/* ERROR */}

        {!loading &&
          error && (

            <div className="tutor-results-status">

              <p>
                {error}
              </p>

              <button
                type="button"
                className="tutor-retry-button"
                onClick={
                  fetchTutors
                }
              >
                Try Again

        {!loading && !error && sortedTutors.length === 0 && (
          <div className="tutor-empty-state">
            <SearchIcon className="tutor-empty-icon" />
            <h2>No tutors found.</h2>
            <p>Try changing your search criteria.</p>
            {(appliedFilters.subject || appliedFilters.location || appliedFilters.mode || appliedFilters.price || appliedFilters.gender) && (
              <button type="button" className="tutor-retry-button" onClick={handleReset}>
                Clear Search

              </button>

            </div>

          )}

        {/* NO RESULTS */}

        {!loading &&
          !error &&
          sortedTutors.length ===
            0 && (

            <div className="tutor-empty-state">

              <SearchIcon className="tutor-empty-icon" />

              <h2>
                No tutors found.
              </h2>

              <p>
                Try changing your
                search criteria.
              </p>

              {(appliedFilters.subject ||
                appliedFilters.location ||
                appliedFilters.mode ||
                appliedFilters.price) && (

                <button
                  type="button"
                  className="tutor-retry-button"
                  onClick={
                    handleReset
                  }
                >
                  Clear Search
                </button>

              )}

            </div>

          )}

        {/* TUTOR CARDS */}

        {!loading &&
          !error &&
          sortedTutors.length >
            0 && (

            <div className="tutor-results-list">

              {sortedTutors.map(
                (tutor) => {

                  /*
                  IMPORTANT:

                  Status lookup uses
                  teacher_profiles.id
                  */

                  const requestState =
                    requestStatusById[
                      tutor.teacherProfileId
                    ] || "idle";

                  return (

                    <TutorCard
                      key={
                        tutor.id
                      }

                      tutor={
                        tutor
                      }

                      isFavorite={
                        favorites.includes(
                          tutor.id
                        )
                      }

                      onToggleFavorite={
                        toggleFavorite
                      }

                      onViewProfile={
                        handleViewProfile
                      }

                      onRequest={
                        handleRequest
                      }

                      requestState={
                        requestState
                      }
                    />

                  );
                }
              )}

            </div>

          )}

      </section>

    </main>
  );
}