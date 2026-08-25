<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StudentProfileController extends Controller
{
    // =========================================================
    // GET STUDENT PROFILE
    // =========================================================

    public function show(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'Only students can access this profile.',
            ], 403);
        }

        // =====================================================
        // LEFT JOIN
        // SQL:
        // SELECT ...
        // FROM users
        // LEFT JOIN student_profiles
        // ON users.id = student_profiles.user_id
        // WHERE users.id = ?
        // =====================================================

        $profileResult = DB::select(
            "
            SELECT
                users.id AS user_id,
                users.name,
                users.email,
                student_profiles.id AS profile_id,
                student_profiles.profile_image,
                student_profiles.phone,
                student_profiles.address,
                student_profiles.education_level,
                student_profiles.institution,
                student_profiles.class_grade,
                student_profiles.preferred_time,
                student_profiles.about_me
            FROM users
            LEFT JOIN student_profiles
                ON users.id = student_profiles.user_id
            WHERE users.id = ?
            LIMIT 1
            ",
            [$user->id]
        );

        $profile = $profileResult[0] ?? null;

        // =====================================================
        // PROFILE IMAGE URL
        // =====================================================

        if ($profile && $profile->profile_image) {
            $profile->profile_image_url =
                $request->getSchemeAndHttpHost()
                . '/storage/'
                . $profile->profile_image;
        } elseif ($profile) {
            $profile->profile_image_url = null;
        }

        // =====================================================
        // MULTIPLE TABLE INNER JOIN
        //
        // users
        // student_subjects
        // subjects
        // =====================================================

        $subjects = DB::select(
            "
            SELECT
                subjects.id,
                subjects.subject_name
            FROM users
            INNER JOIN student_subjects
                ON users.id = student_subjects.student_id
            INNER JOIN subjects
                ON student_subjects.subject_id = subjects.id
            WHERE users.id = ?
            ORDER BY subjects.subject_name ASC
            ",
            [$user->id]
        );

        return response()->json([
            'message' => 'Student profile retrieved successfully.',
            'profile' => $profile,
            'subjects' => $subjects,
        ]);
    }

    // =========================================================
    // UPDATE STUDENT PROFILE
    // =========================================================

    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'Only students can update this profile.',
            ], 403);
        }

        // =====================================================
        // VALIDATION
        // =====================================================

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],

            'profile_image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,gif',
                'max:2048',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'education_level' => [
                'nullable',
                'string',
                'max:100',
            ],

            'institution' => [
                'nullable',
                'string',
                'max:255',
            ],

            'class_grade' => [
                'nullable',
                'string',
                'max:100',
            ],

            'preferred_time' => [
                'nullable',
                'string',
                'max:100',
            ],

            'about_me' => [
                'nullable',
                'string',
                'max:300',
            ],

            'subject_ids' => [
                'nullable',
                'array',
            ],

            'subject_ids.*' => [
                'integer',
                'exists:subjects,id',
            ],
        ]);

        DB::beginTransaction();

        try {

            // =================================================
            // UPDATE USERS
            // =================================================

            DB::update(
                "
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    updated_at = NOW()
                WHERE id = ?
                ",
                [
                    $validated['name'],
                    $validated['email'],
                    $user->id
                ]
            );

            // =================================================
            // CHECK EXISTING STUDENT PROFILE
            // =================================================

            $existingProfile = DB::select(
                "
                SELECT id, profile_image
                FROM student_profiles
                WHERE user_id = ?
                LIMIT 1
                ",
                [$user->id]
            );

            $profileId =
                $existingProfile[0]->id
                ?? null;

            $oldImage =
                $existingProfile[0]->profile_image
                ?? null;

            // =================================================
            // PROFILE IMAGE
            // =================================================

            $imagePath = $oldImage;

            if ($request->hasFile('profile_image')) {

                $image = $request->file('profile_image');

                // Delete old image
                if (
                    $oldImage &&
                    Storage::disk('public')->exists($oldImage)
                ) {
                    Storage::disk('public')->delete($oldImage);
                }

                // Store new image
                $imagePath = $image->store(
                    'student_profiles',
                    'public'
                );
            }

            // =================================================
            // INSERT OR UPDATE STUDENT PROFILE
            // =================================================

            if ($profileId) {

                DB::update(
                    "
                    UPDATE student_profiles
                    SET
                        profile_image = ?,
                        phone = ?,
                        address = ?,
                        education_level = ?,
                        institution = ?,
                        class_grade = ?,
                        preferred_time = ?,
                        about_me = ?,
                        updated_at = NOW()
                    WHERE id = ?
                    ",
                    [
                        $imagePath,
                        $validated['phone'] ?? null,
                        $validated['address'] ?? null,
                        $validated['education_level'] ?? null,
                        $validated['institution'] ?? null,
                        $validated['class_grade'] ?? null,
                        $validated['preferred_time'] ?? null,
                        $validated['about_me'] ?? null,
                        $profileId
                    ]
                );

            } else {

                DB::insert(
                    "
                    INSERT INTO student_profiles
                    (
                        user_id,
                        profile_image,
                        phone,
                        address,
                        education_level,
                        institution,
                        class_grade,
                        preferred_time,
                        about_me,
                        created_at,
                        updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    ",
                    [
                        $user->id,
                        $imagePath,
                        $validated['phone'] ?? null,
                        $validated['address'] ?? null,
                        $validated['education_level'] ?? null,
                        $validated['institution'] ?? null,
                        $validated['class_grade'] ?? null,
                        $validated['preferred_time'] ?? null,
                        $validated['about_me'] ?? null
                    ]
                );

                $newProfile = DB::select(
                    "
                    SELECT id
                    FROM student_profiles
                    WHERE user_id = ?
                    LIMIT 1
                    ",
                    [$user->id]
                );

                $profileId =
                    $newProfile[0]->id ?? null;
            }

            // =================================================
            // SUBJECTS
            // =================================================

            if ($request->has('subject_ids')) {

                // Delete previous subject relationships

                DB::delete(
                    "
                    DELETE FROM student_subjects
                    WHERE student_id = ?
                    ",
                    [$user->id]
                );

                // Insert selected subjects

                $subjectIds =
                    $validated['subject_ids'] ?? [];

                foreach ($subjectIds as $subjectId) {

                    DB::insert(
                        "
                        INSERT INTO student_subjects
                        (
                            student_id,
                            subject_id
                        )
                        VALUES (?, ?)
                        ",
                        [
                            $user->id,
                            $subjectId
                        ]
                    );
                }
            }

            DB::commit();

            // =================================================
            // GET UPDATED PROFILE
            // =================================================

            $updatedProfile = DB::select(
                "
                SELECT
                    users.id AS user_id,
                    users.name,
                    users.email,
                    student_profiles.id AS profile_id,
                    student_profiles.profile_image,
                    student_profiles.phone,
                    student_profiles.address,
                    student_profiles.education_level,
                    student_profiles.institution,
                    student_profiles.class_grade,
                    student_profiles.preferred_time,
                    student_profiles.about_me
                FROM users
                LEFT JOIN student_profiles
                    ON users.id = student_profiles.user_id
                WHERE users.id = ?
                LIMIT 1
                ",
                [$user->id]
            );

            $profile =
                $updatedProfile[0] ?? null;

            $imageUrl = null;

            if ($profile && $profile->profile_image) {
                $imageUrl =
                    $request->getSchemeAndHttpHost()
                    . '/storage/'
                    . $profile->profile_image;
            }

            return response()->json([
                'message' =>
                    'Profile updated successfully!',

                'profile' =>
                    $profile,

                'profile_image_url' =>
                    $imageUrl,
            ]);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'message' =>
                    'Profile update failed.',

                'error' =>
                    $e->getMessage(),
            ], 500);
        }
    }

    // =========================================================
    // SUBJECTS
    // =========================================================

    public function subjects()
    {
        $subjects = DB::select(
            "
            SELECT
                id,
                subject_name
            FROM subjects
            ORDER BY subject_name ASC
            "
        );

        return response()->json([
            'subjects' => $subjects,
        ]);
    }

    // =========================================================
    // INNER JOIN
    // =========================================================

    public function innerJoin(Request $request)
    {
        $user = $request->user();

        $result = DB::select(
            "
            SELECT
                users.id,
                users.name,
                users.email,
                student_profiles.phone,
                student_profiles.address
            FROM users
            INNER JOIN student_profiles
                ON users.id = student_profiles.user_id
            WHERE users.id = ?
            ",
            [$user->id]
        );

        return response()->json([
            'profile' => $result[0] ?? null,
        ]);
    }

    // =========================================================
    // RIGHT JOIN
    // =========================================================

    public function rightJoin(Request $request)
    {
        $user = $request->user();

        $result = DB::select(
            "
            SELECT
                users.id,
                users.name,
                users.email,
                student_profiles.phone,
                student_profiles.address
            FROM users
            RIGHT JOIN student_profiles
                ON users.id = student_profiles.user_id
            WHERE users.id = ?
            ",
            [$user->id]
        );

        return response()->json([
            'profile' => $result[0] ?? null,
        ]);
    }
}