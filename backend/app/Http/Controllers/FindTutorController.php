<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class FindTutorController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LIST / SEARCH TUTORS
    |--------------------------------------------------------------------------
    |
    | GET /api/find-tutor
    |
    | Optional query params:
    |   subject      - subject name (partial match)
    |   subject_id   - exact subject id
    |   location     - location (partial match)
    |   mode         - online | in-person | both
    |   min_price    - minimum hourly rate
    |   max_price    - maximum hourly rate
    |   gender       - Male | Female | Other
    |   per_page     - results per page (default 12, max 50)
    |
    | Only returns users with role = teacher who have a saved
    | teacher profile.
    |
    */

    public function index(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'location' => 'nullable|string|max:255',
            'mode' => 'nullable|string|in:online,in-person,both',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'gender' => 'nullable|string|max:20',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = User::query()
            ->where('role', 'teacher')
            ->whereHas('teacherProfile')
            ->with([
                'teacherProfile.subjects:id,subject_name',
                'teacherProfile.languages:id,language_name',
            ])
            ->withAvg(
                ['reviews' => fn ($q) => $q->where('status', 'approved')],
                'rating'
            )
            ->withCount(
                ['reviews' => fn ($q) => $q->where('status', 'approved')]
            )
            ->select('id', 'name');

        /*
        |--------------------------------------------------------------------------
        | SUBJECT FILTER
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['subject_id'])) {
            $subjectId = $validated['subject_id'];

            $query->whereHas(
                'teacherProfile.subjects',
                function ($q) use ($subjectId) {
                    $q->where('subjects.id', $subjectId);
                }
            );
        } elseif (!empty($validated['subject'])) {
            $subject = $validated['subject'];

            $query->whereHas(
                'teacherProfile.subjects',
                function ($q) use ($subject) {
                    $q->where(
                        'subjects.subject_name',
                        'like',
                        '%' . $subject . '%'
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | LOCATION FILTER
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['location'])) {
            $location = $validated['location'];

            $query->whereHas(
                'teacherProfile',
                function ($q) use ($location) {
                    $q->where(
                        'location',
                        'like',
                        '%' . $location . '%'
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | TUTORING MODE FILTER
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['mode'])) {
            $mode = $validated['mode'];

            $query->whereHas(
                'teacherProfile',
                function ($q) use ($mode) {
                    if ($mode === 'both') {
                        $q->where('tutoring_mode', 'both');
                    } else {
                        $q->whereIn(
                            'tutoring_mode',
                            [$mode, 'both']
                        );
                    }
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PRICE FILTER
        |--------------------------------------------------------------------------
        */

        if (
            isset($validated['min_price']) ||
            isset($validated['max_price'])
        ) {
            $minPrice = $validated['min_price'] ?? null;
            $maxPrice = $validated['max_price'] ?? null;

            $query->whereHas(
                'teacherProfile',
                function ($q) use ($minPrice, $maxPrice) {
                    if ($minPrice !== null) {
                        $q->where(
                            'hourly_rate',
                            '>=',
                            $minPrice
                        );
                    }

                    if ($maxPrice !== null) {
                        $q->where(
                            'hourly_rate',
                            '<=',
                            $maxPrice
                        );
                    }
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | GENDER FILTER
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['gender'])) {
            $gender = $validated['gender'];

            $query->whereHas(
                'teacherProfile',
                function ($q) use ($gender) {
                    $q->whereRaw(
                        'LOWER(gender) = ?',
                        [strtolower($gender)]
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PAGINATE
        |--------------------------------------------------------------------------
        */

        $perPage = $validated['per_page'] ?? 12;

        $teachers = $query
            ->orderBy('name')
            ->paginate($perPage);

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

        /*
        |--------------------------------------------------------------------------
        | FORMAT TUTORS
        |--------------------------------------------------------------------------
        */

        $tutors = $teachers
            ->getCollection()
            ->map(
                fn ($teacher) => $this->formatTutorCard(
                    $teacher,
                    $request
                )
            )
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

    /*
    |--------------------------------------------------------------------------
    | SHOW SINGLE TUTOR
    |--------------------------------------------------------------------------
    |
    | GET /api/find-tutor/{id}
    |
    */

    public function show(Request $request, $id)
    {
        $teacher = User::query()
            ->where('role', 'teacher')
            ->whereHas('teacherProfile')
            ->with([
                'teacherProfile.subjects:id,subject_name',
                'teacherProfile.languages:id,language_name',
            ])
            ->withAvg(
                ['reviews' => fn ($q) => $q->where('status', 'approved')],
                'rating'
            )
            ->withCount(
                ['reviews' => fn ($q) => $q->where('status', 'approved')]
            )
            ->select('id', 'name', 'created_at')
            ->find($id);

        if (!$teacher) {
            return response()->json([
                'message' => 'Tutor not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Tutor profile retrieved successfully.',
            'tutor' => array_merge(
                $this->formatTutorCard($teacher, $request),
                $this->formatTutorDetails($teacher)
            ),
        ], 200);
    }

    /*
    |--------------------------------------------------------------------------
    | FORMAT TUTOR DETAILS
    |--------------------------------------------------------------------------
    |
    | Extra fields for the full tutor profile page.
    |
    | Only public-safe fields are added here.
    | phone, email and date_of_birth are intentionally NOT exposed.
    |
    */

    private function formatTutorDetails(User $teacher): array
    {
        $profile = $teacher->teacherProfile;

        // Only approved reviews are public.
        $reviews = Review::with('student:id,name')
            ->where('teacher_id', $teacher->id)
            ->where('status', 'approved')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($review) => [
                'id' => $review->id,
                'student_name' => $review->student?->name ?? 'Student',
                'rating' => $review->rating,
                'review_text' => $review->review_text,
                'created_at' => $review->created_at?->toIso8601String(),
            ])
            ->values();

        return [
            'institution' => $profile->institution,
            'certification' => $profile->certification,
            'time_zone' => $profile->time_zone,
            'member_since' => $teacher->created_at?->toIso8601String(),
            'reviews' => $reviews,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | FORMAT A TEACHER INTO A TUTOR CARD SHAPE
    |--------------------------------------------------------------------------
    */

    private function formatTutorCard(
        User $teacher,
        Request $request
    ): array {
        $profile = $teacher->teacherProfile;

        $profilePictureUrl = null;

        if ($profile && $profile->profile_image) {
            $profilePictureUrl =
                $request->getSchemeAndHttpHost()
                . '/'
                . $profile->profile_image;
        }

        $rating =
            $teacher->reviews_avg_rating !== null
                ? round(
                    (float) $teacher->reviews_avg_rating,
                    1
                )
                : null;

        return [
            // users.id: used by the tutor profile and request APIs.
            'teacher_id' => $teacher->id,

            // teacher_profiles.id: retained for existing consumers.
            'teacher_profile_id' => $profile->id,

            'name' => $teacher->name,
            'profile_picture' => $profilePictureUrl,
            'location' => $profile->location,
            'gender' => $profile->gender,
            'subjects' => $profile->subjects
                ->pluck('subject_name')
                ->values(),
            'qualification' => $profile->qualification,
            'teaching_experience' => $profile->teaching_experience,
            'tutoring_mode' => $profile->tutoring_mode,
            'hourly_rate' => $profile->hourly_rate,
            'availability' => $profile->availability,
            'bio' => $profile->bio,
            'languages' => $profile->languages
                ->pluck('language_name')
                ->values(),
            'rating' => $rating,
            'review_count' => $teacher->reviews_count,
        ];
    }
}