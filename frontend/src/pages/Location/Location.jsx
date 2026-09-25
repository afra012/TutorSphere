import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./Location.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const API_URL = "http://127.0.0.1:8000/api";

const defaultCenter = [23.685, 90.3563];

const bangladeshBounds = [
  [20.375, 88.0],
  [26.7, 92.7],
];

function MapClickHandler({ onSelect }) {
  useMapEvents({ click: onSelect });
  return null;
}

const roleIcons = {
  teacher: L.divIcon({ className: "role-map-icon teacher-role-icon", html: "&#x1F468;&#x200D;&#x1F3EB;", iconSize: [36, 36], iconAnchor: [18, 18] }),
  student: L.divIcon({ className: "role-map-icon student-role-icon", html: "&#x1F393;", iconSize: [36, 36], iconAnchor: [18, 18] }),
};

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function Location() {
  const [locations, setLocations] = useState([]);
  const [myLocation, setMyLocation] = useState(null);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");

  // ---------------------------------------------------------
  // Get all saved student and teacher locations
  // ---------------------------------------------------------
  const fetchLocations = async () => {
    try {
      if (!token) {
        setError("You must be logged in to view locations.");
        return;
      }

      const response = await fetch(`${API_URL}/locations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load locations."
        );
      }

      setLocations(data.locations || []);
    } catch (err) {
      console.error("Fetch locations error:", err);

      setError(
        err.message || "Failed to load locations."
      );
    }
  };

  // ---------------------------------------------------------
  // Get logged-in user's own location
  // ---------------------------------------------------------
  const fetchMyLocation = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/locations/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load your location."
        );
      }

      const location = data.location;

      setMyLocation(location);

      if (location) {
        setLatitude(location.latitude ?? "");
        setLongitude(location.longitude ?? "");
      }

      // Profile addresses are suggestions only; map locations change only
      // when the user saves an update from this page.
      const userResponse = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const userData = userResponse.ok ? await userResponse.json() : {};
      let role = String(userData.role || localStorage.getItem("role") || "").toLowerCase();
      if (!role) {
        try {
          const storedUser = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "{}");
          role = String(storedUser.role || "").toLowerCase();
        } catch { /* Ignore invalid cached user data. */ }
      }
      const profileEndpoint = role === "teacher"
        ? `${API_URL}/teacher-profile`
        : role === "student"
        ? `${API_URL}/student/profile`
        : null;

      if (profileEndpoint) {
        const profileResponse = await fetch(profileEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const profileData = profileResponse.ok ? await profileResponse.json() : {};
        const profileAddress = role === "teacher"
          ? (profileData.profile?.location || profileData.location)
          : (profileData.profile?.address || profileData.address);

        setAddress(profileAddress || location?.address || "");
        if (profileAddress) localStorage.setItem(`profileAddress:${userData.id || "me"}`, profileAddress);
      } else {
        setAddress(location?.address || localStorage.getItem("profileAddress:me") || "");
      }
    } catch (err) {
      console.error(
        "Fetch my location error:",
        err
      );

      setError(
        err.message ||
          "Failed to load your location."
      );
    }
  };

  // ---------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      if (!token) {
        setError(
          "You must be logged in to view locations."
        );
        setLoading(false);
        return;
      }

      await Promise.all([
        fetchLocations(),
        fetchMyLocation(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ---------------------------------------------------------
  // Get current browser location
  // ---------------------------------------------------------
  const handleGetCurrentLocation = async () => {
    setError("");
    setSuccess("");

    setGettingLocation(true);
    try {
      if (!address.trim()) throw new Error("Enter an address first.");
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bd&q=${encodeURIComponent(address.trim())}`, { headers: { Accept: "application/json" } });
      const results = await response.json();
      if (!results.length) throw new Error("Address not found. Try a more specific address or click the map.");
      setLatitude(Number(results[0].lat).toFixed(7));
      setLongitude(Number(results[0].lon).toFixed(7));
      setSuccess("Address found. Save to update your map location.");
    } catch (err) { setError(err.message || "Could not find address."); }
    finally { setGettingLocation(false); }
  };

  const handleMapClick = async ({ latlng }) => {
    setLatitude(latlng.lat.toFixed(7));
    setLongitude(latlng.lng.toFixed(7));
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18`, { headers: { Accept: "application/json" } });
      const data = await response.json();
      if (data.display_name) setAddress(data.display_name);
    } catch (err) { console.error("Reverse geocoding error:", err); }
  };

  // ---------------------------------------------------------
  // Save / update location
  // ---------------------------------------------------------
  const handleSaveLocation = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "You must be logged in to save your location."
      );
      return;
    }

    if (!latitude || !longitude) {
      setError(
        "Find the address or click the map to choose a location first."
      );
      return;
    }

    if (!address.trim()) {
      setError("Address is required.");
      return;
    }

    setSaving(true);

    try {
      const existingLocationId =
        myLocation?.id ||
        myLocation?.location_id;

      const url = existingLocationId
        ? `${API_URL}/locations/${existingLocationId}`
        : `${API_URL}/locations`;

      const method = existingLocationId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: Number(latitude),
          longitude: Number(longitude),
          address: address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save location."
        );
      }

      setMyLocation(data.location);

      setLatitude(
        data.location.latitude ?? ""
      );

      setLongitude(
        data.location.longitude ?? ""
      );

      setAddress(
        data.location.address ?? ""
      );

      setSuccess(
        existingLocationId
          ? "Location updated successfully."
          : "Location saved successfully."
      );

      await fetchLocations();
      await fetchMyLocation();
    } catch (err) {
      console.error(
        "Save location error:",
        err
      );

      setError(
        err.message ||
          "Failed to save location."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="location-page">
      <div className="location-container">

        {/* Header */}
        <div className="location-header">
          <span className="location-badge">
            LOCATION
          </span>

          <h1>
            Student & Teacher Locations
          </h1>

          <p>
            See the saved locations of registered
            students and teachers across Bangladesh.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="location-message error">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="location-message success">
            {success}
          </div>
        )}

        {/* Bangladesh Map */}
        <div className="location-map-card">
          {loading ? (
            <div className="location-map-loading">
              Loading locations...
            </div>
          ) : (
            <MapContainer
              bounds={bangladeshBounds}
              center={defaultCenter}
              zoom={7}
              minZoom={6}
              maxZoom={18}
              scrollWheelZoom={true}
              className="location-map"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onSelect={handleMapClick} />

              {/* All saved Student and Teacher locations */}
              {locations.map((location) => {
                const lat = Number(
                  location.latitude
                );

                const lng = Number(
                  location.longitude
                );

                if (
                  !Number.isFinite(lat) ||
                  !Number.isFinite(lng)
                ) {
                  return null;
                }

                return (
                  <Marker
                    key={location.id || location.location_id}
                    icon={roleIcons[location.role]}
                    position={[lat, lng]}
                  >
                    <Popup>
                      <div
                        style={{
                          minWidth: "190px",
                          lineHeight: "1.6",
                        }}
                      >
                        <strong>
                          {location.name}
                        </strong>

                        <br />

                        <span>
                          {location.role ===
                          "teacher"
                            ? "👨‍🏫 Teacher"
                            : "🎓 Student"}
                        </span>

                        <br />

                        <span>
                          📍 {location.address}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* My Location Form */}
        <div className="location-form-card">

          <div className="location-form-header">
            <span className="location-form-badge">
              MY LOCATION
            </span>

            <h2>
              {myLocation
                ? "Update Your Location"
                : "Set Your Location"}
            </h2>

          <p>
            Profile address is shown automatically. Find an address or click the map to set your location.
          </p>
          {address && !myLocation && (
            <p className="location-profile-address">
              Saved profile address: <strong>{address}</strong>. Search it above, then save to place your map pin.
            </p>
          )}
          </div>

          {/* Address lookup */}
          <button
            type="button"
            className="location-current-button"
            onClick={
              handleGetCurrentLocation
            }
            disabled={gettingLocation}
          >
            {gettingLocation
              ? "Finding Address..."
              : "Find address on map"}
          </button>

          <form
            onSubmit={handleSaveLocation}
          >
            <div className="location-form-grid">

              {/* Latitude */}
              <div className="location-input-group">
                <label>
                  Latitude
                </label>

                <input
                  type="text"
                  value={latitude}
                  readOnly
                  placeholder="Automatically detected"
                />
              </div>

              {/* Longitude */}
              <div className="location-input-group">
                <label>
                  Longitude
                </label>

                <input
                  type="text"
                  value={longitude}
                  readOnly
                  placeholder="Automatically detected"
                />
              </div>

            </div>

            {/* Address */}
            <div className="location-input-group">
              <label>
                Address
              </label>

              <input
                type="text"
                value={address}
                onChange={(event) =>
                  setAddress(
                    event.target.value
                  )
                }
                placeholder="Your location address"
                maxLength={255}
              />
            </div>

            {/* Save / Update */}
            <button
              type="submit"
              className="location-save-button"
              disabled={
                saving ||
                gettingLocation
              }
            >
              {saving
                ? "Saving..."
                : myLocation
                ? "Update Location"
                : "Save Location"}
            </button>
          </form>
        </div>

        {/* Information */}
        <div className="location-info-card">
          <h3>
            How Location Works
          </h3>

          <p>
            Students and teachers who save their
            location will appear on the Bangladesh
            map. Click a marker to see the person's
            name, role, and address. To change your
            own location, use this page again.
          </p>
        </div>

      </div>
    </main>
  );
}

export default Location;
