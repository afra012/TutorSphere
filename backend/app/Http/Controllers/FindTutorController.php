<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class FindTutorController extends Controller
{
    // =========================================================
    // LIST / SEARCH TUTORS
    // =========================================================
    //
    // GET /api/find-tutor
    //
    // Optional query params:
    //   subject      - subject name (partial match)
    //   subject_id   - exact subject id
    //   location     - location (partial match)
    //   mode         - online | in_person | both
    //   min_price    - minimum hourly rate
    //   max_price    - maximum hourly rate
    //   per_page     - results per page (default 12, max 50)
    //
    // Only returns users with role = teacher who have a saved
    // teacher profile. No mock/hardcoded data - everything is
    // pulled from users / teacher_profiles and related tables.
    // =========================================================

    public function index(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'location' => 'nullable|string|max:255',
            'mode' => 'nullable|string|in:online,in_person,both',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);


        // ---------------------------------------------------------
        // BASE QUERY
        //
        // Only Teacher-role users that have already created/saved
        // a teacher profile (whereHas = inner-join style filter,
        // so students and teachers-without-profiles never appear).
        // ---------------------------------------------------------

        $query = User::query()
            ->where('role', 'teacher')
            ->whereHas('teacherProfile')
            ->with([
                'teacherProfile.subjects:id,subject_name',
                'teacherProfile.languages:id,language_name',
            ])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->select('id', 'name');


        // ---------------------------------------------------------
        // FILTER: SUBJECT
        // ---------------------------------------------------------

        if (!empty($validated['subject_id'])) {

            $subjectId = $validated['subject_id'];

            $query->whereHas('teacherProfile.subjects', function ($q) use ($subjectId) {
                $q->where('subjects.id', $subjectId);
            });

        } elseif (!empty($validated['subject'])) {

            $subject = $validated['subject'];

            $query->whereHas('teacherProfile.subjects', function ($q) use ($subject) {
                $q->where('subjects.subject_name', 'like', '%' . $subject . '%');
            });
        }


        // ---------------------------------------------------------
        // FILTER: LOCATION
        // ---------------------------------------------------------

        if (!empty($validated['location'])) {

            $location = $validated['location'];

            $query->whereHas('teacherProfile', function ($q) use ($location) {
                $q->where('location', 'like', '%' . $location . '%');
            });
        }


        // ---------------------------------------------------------
        // FILTER: TUTORING MODE
        //
        // A teacher offering "both" should still show up when a
        // student filters by online or in_person specifically.
        // ---------------------------------------------------------

        if (!empty($validated['mode'])) {

            $mode = $validated['mode'];

            $query->whereHas('teacherProfile', function ($q) use ($mode) {
                if ($mode === 'both') {
                    $q->where('tutoring_mode', 'both');
                } else {
                    $q->whereIn('tutoring_mode', [$mode, 'both']);
                }
            });
        }


        // ---------------------------------------------------------
        // FILTER: PRICE RANGE
        // ---------------------------------------------------------

        if (isset($validated['min_price']) || isset($validated['max_price'])) {

            $minPrice = $validated['min_price'] ?? null;
            $maxPrice = $validated['max_price'] ?? null;

            $query->whereHas('teacherProfile', function ($q) use ($minPrice, $maxPrice) {

                if ($minPrice !== null) {
                    $q->where('hourly_rate', '>=', $minPrice);
                }

                if ($maxPrice !== null) {
                    $q->where('hourly_rate', '<=', $maxPrice);
                }
            });
        }


        // ---------------------------------------------------------
        // PAGINATE
        // ---------------------------------------------------------

        $perPage = $validated['per_page'] ?? 12;

        $teachers = $query->orderBy('name')->paginate($perPage);


        // ---------------------------------------------------------
        // NO RESULT CASE
        // ---------------------------------------------------------

        if ($teachers->isEmpty()) {
            return response()->json([
                'message' => 'No tutors found matching your search.',
                'tutors' => [],
                'meta' => [
                    'current_page' => $teachers->currentPage(),
                    'last_page' => $teachers->lastPage(),
                    'per_page' => $teachers->perPage(),
                    'total' => $teachers->total(),
                ],
            ], 200);
        }


        // ---------------------------------------------------------
        // FORMAT FOR TUTOR PROFILE CARDS
        // ---------------------------------------------------------

        $tutors = $teachers->getCollection()
            ->map(fn ($teacher) => $this->formatTutorCard($teacher, $request))
            ->values();

        return response()->json([
            'message' => 'Tutors retrieved successfully.',
            'tutors' => $tutors,
            'meta' => [
                'current_page' => $teachers->currentPage(),
                'last_page' => $teachers->lastPage(),
                'per_page' => $teachers->perPage(),
                'total' => $teachers->total(),
            ],
        ], 200);
    }


    // =========================================================
    // SHOW A SINGLE TUTOR (for View Profile / Send Request)
    // =========================================================
    //
    // GET /api/find-tutor/{id}
    //
    // {id} is the Teacher's user id (users.id), so the same id
    // returned in the tutor cards can be reused directly here
    // and by future features.
    // =========================================================

    public function show(Request $request, $id)
    {
        $teacher = User::query()
            ->where('role', 'teacher')
            ->whereHas('teacherProfile')
            ->with([
                'teacherProfile.subjects:id,subject_name',
                'teacherProfile.languages:id,language_name',
            ])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->select('id', 'name')
            ->find($id);

        if (!$teacher) {
            return response()->json([
                'message' => 'Tutor not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Tutor profile retrieved successfully.',
            'tutor' => $this->formatTutorCard($teacher, $request),
        ], 200);
    }


    // =========================================================
    // FORMAT A TEACHER INTO A TUTOR PROFILE CARD SHAPE
    // =========================================================

    private function formatTutorCard(User $teacher, Request $request): array
    {
        $profile = $teacher->teacherProfile;


        // -------------------------------------------------------
        // PROFILE PICTURE URL (same pattern as TeacherProfileController)
        // -------------------------------------------------------

        $profilePictureUrl = null;

        if ($profile && $profile->profile_image) {
            $profilePictureUrl =
                $request->getSchemeAndHttpHost()
                . '/'
                . $profile->profile_image;
        }


        // -------------------------------------------------------
        // RATING
        // -------------------------------------------------------

        $rating = $teacher->reviews_avg_rating !== null
            ? round((float) $teacher->reviews_avg_rating, 1)
            : null;

        return [
            'teacher_id' => $teacher->id,
            'name' => $teacher->name,
            'profile_picture' => $profilePictureUrl,
            'location' => $profile->location,
            'subjects' => $profile->subjects->pluck('subject_name')->values(),
            'qualification' => $profile->qualification,
            'teaching_experience' => $profile->teaching_experience,
            'tutoring_mode' => $profile->tutoring_mode,
            'hourly_rate' => $profile->hourly_rate,
            'availability' => $profile->availability,
            'bio' => $profile->bio,
            'languages' => $profile->languages->pluck('language_name')->values(),
            'rating' => $rating,
            'review_count' => $teacher->reviews_count,
        ];
    }
}
