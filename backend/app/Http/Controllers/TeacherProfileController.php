<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherProfileController extends Controller
{
    // =========================================================
    // GET SUBJECTS
    // =========================================================

    public function subjects()
    {
        $subjects = DB::select(
            "SELECT id, subject_name
             FROM subjects
             ORDER BY subject_name ASC"
        );

        return response()->json([
            'subjects' => $subjects
        ]);
    }


    // =========================================================
    // GET LANGUAGES
    // =========================================================

    public function languages()
    {
        $languages = DB::select(
            "SELECT id, language_name
             FROM languages
             ORDER BY language_name ASC"
        );

        return response()->json([
            'languages' => $languages
        ]);
    }


    // =========================================================
    // SHOW TEACHER PROFILE
    // =========================================================

    public function show(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }


        // ---------------------------------------------------------
        // RAW SQL - LEFT JOIN
        // ---------------------------------------------------------

        $profile = DB::selectOne(
            "SELECT
                users.id AS user_id,
                users.name,
                users.email,

                teacher_profiles.id AS teacher_profile_id,
                teacher_profiles.phone,
                teacher_profiles.location,
                teacher_profiles.date_of_birth,
                teacher_profiles.gender,
                teacher_profiles.qualification,
                teacher_profiles.teaching_experience,
                teacher_profiles.hourly_rate,
                teacher_profiles.institution,
                teacher_profiles.certification,
                teacher_profiles.bio,
                teacher_profiles.availability,
                teacher_profiles.tutoring_mode,
                teacher_profiles.time_zone,
                teacher_profiles.profile_image

             FROM users

             LEFT JOIN teacher_profiles
                ON users.id = teacher_profiles.user_id

             WHERE users.id = ?",
            [$user->id]
        );


        if (!$profile) {
            return response()->json([
                'profile' => null
            ], 404);
        }


        // ---------------------------------------------------------
        // RAW SQL - TEACHER SUBJECTS
        // ---------------------------------------------------------

        $subjects = DB::select(
            "SELECT
                subjects.id,
                subjects.subject_name

             FROM teacher_profile_subject

             INNER JOIN subjects
                ON teacher_profile_subject.subject_id = subjects.id

             WHERE teacher_profile_subject.teacher_profile_id = ?

             ORDER BY subjects.subject_name ASC",
            [$profile->teacher_profile_id]
        );


        // ---------------------------------------------------------
        // RAW SQL - TEACHER LANGUAGES
        // ---------------------------------------------------------

        $languages = DB::select(
            "SELECT
                languages.id,
                languages.language_name

             FROM teacher_profile_language

             INNER JOIN languages
                ON teacher_profile_language.language_id = languages.id

             WHERE teacher_profile_language.teacher_profile_id = ?

             ORDER BY languages.language_name ASC",
            [$profile->teacher_profile_id]
        );


        // ---------------------------------------------------------
        // PROFILE IMAGE URL
        // ---------------------------------------------------------

        if ($profile->profile_image) {
            $profile->profile_image_url =
                $request->getSchemeAndHttpHost()
                . '/'
                . $profile->profile_image;
        } else {
            $profile->profile_image_url = null;
        }


        return response()->json([
            'message' => 'Teacher profile retrieved successfully.',
            'profile' => $profile,
            'subjects' => $subjects,
            'languages' => $languages
        ]);
    }


    // =========================================================
    // UPDATE TEACHER PROFILE
    // =========================================================

    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }


        // ---------------------------------------------------------
        // VALIDATION
        // ---------------------------------------------------------

        $validated = $request->validate([
            'fullName' => 'required|string|max:255',

            'email' => 'required|email|max:255',

            'phone' => 'nullable|string|max:30',

            'location' => 'nullable|string|max:255',

            'birthDate' => 'nullable|date',

            'gender' => 'nullable|string|max:50',

            'subjects' => 'nullable|array',

            'subjects.*' => 'exists:subjects,id',

            'qualification' => 'nullable|string|max:255',

            'experience' => 'nullable|string|max:100',

            'hourlyRate' => 'nullable|numeric|min:0',

            'institution' => 'nullable|string|max:255',

            'certification' => 'nullable|string|max:255',

            'bio' => 'nullable|string|max:300',

            'languages' => 'nullable|array',

            'languages.*' => 'exists:languages,id',

            'availability' => 'nullable|string|max:100',

            'tutoringMode' => 'nullable|string|max:50',

            'timeZone' => 'nullable|string|max:100',
        ]);


        DB::beginTransaction();

        try {

            // =====================================================
            // UPDATE USERS
            // =====================================================

            DB::update(
                "UPDATE users
                 SET
                    name = ?,
                    email = ?,
                    updated_at = ?

                 WHERE id = ?",
                [
                    $validated['fullName'],
                    $validated['email'],
                    now(),
                    $user->id
                ]
            );


            // =====================================================
            // CHECK TEACHER PROFILE
            // =====================================================

            $profile = DB::selectOne(
                "SELECT id
                 FROM teacher_profiles
                 WHERE user_id = ?",
                [$user->id]
            );


            // =====================================================
            // INSERT OR UPDATE TEACHER PROFILE
            // =====================================================

            if ($profile) {

                // -------------------------------------------------
                // UPDATE
                // -------------------------------------------------

                DB::update(
                    "UPDATE teacher_profiles
                     SET
                        phone = ?,
                        location = ?,
                        date_of_birth = ?,
                        gender = ?,
                        qualification = ?,
                        teaching_experience = ?,
                        hourly_rate = ?,
                        institution = ?,
                        certification = ?,
                        bio = ?,
                        availability = ?,
                        tutoring_mode = ?,
                        time_zone = ?,
                        updated_at = ?

                     WHERE id = ?",
                    [
                        $validated['phone'] ?? null,
                        $validated['location'] ?? null,
                        $validated['birthDate'] ?? null,
                        $validated['gender'] ?? null,
                        $validated['qualification'] ?? null,
                        $validated['experience'] ?? null,
                        $validated['hourlyRate'] ?? null,
                        $validated['institution'] ?? null,
                        $validated['certification'] ?? null,
                        $validated['bio'] ?? null,
                        $validated['availability'] ?? null,
                        $validated['tutoringMode'] ?? null,
                        $validated['timeZone'] ?? null,
                        now(),
                        $profile->id
                    ]
                );

                $teacherProfileId = $profile->id;

            } else {

                // -------------------------------------------------
                // INSERT
                // -------------------------------------------------

                DB::insert(
                    "INSERT INTO teacher_profiles
                    (
                        user_id,
                        phone,
                        location,
                        date_of_birth,
                        gender,
                        qualification,
                        teaching_experience,
                        hourly_rate,
                        institution,
                        certification,
                        bio,
                        availability,
                        tutoring_mode,
                        time_zone,
                        created_at,
                        updated_at
                    )

                    VALUES
                    (
                        ?, ?, ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?, ?, ?, ?
                    )",
                    [
                        $user->id,
                        $validated['phone'] ?? null,
                        $validated['location'] ?? null,
                        $validated['birthDate'] ?? null,
                        $validated['gender'] ?? null,
                        $validated['qualification'] ?? null,
                        $validated['experience'] ?? null,
                        $validated['hourlyRate'] ?? null,
                        $validated['institution'] ?? null,
                        $validated['certification'] ?? null,
                        $validated['bio'] ?? null,
                        $validated['availability'] ?? null,
                        $validated['tutoringMode'] ?? null,
                        $validated['timeZone'] ?? null,
                        now(),
                        now()
                    ]
                );


                // Get newly created profile ID

                $newProfile = DB::selectOne(
                    "SELECT id
                     FROM teacher_profiles
                     WHERE user_id = ?",
                    [$user->id]
                );

                $teacherProfileId = $newProfile->id;
            }


            // =====================================================
            // SUBJECTS
            // =====================================================

            // Delete old subjects

            DB::delete(
                "DELETE FROM teacher_profile_subject
                 WHERE teacher_profile_id = ?",
                [$teacherProfileId]
            );


            // Insert new subjects

            if (!empty($validated['subjects'])) {

                foreach ($validated['subjects'] as $subjectId) {

                    DB::insert(
                        "INSERT INTO teacher_profile_subject
                        (
                            teacher_profile_id,
                            subject_id,
                            created_at,
                            updated_at
                        )

                        VALUES (?, ?, ?, ?)",
                        [
                            $teacherProfileId,
                            $subjectId,
                            now(),
                            now()
                        ]
                    );
                }
            }


            // =====================================================
            // LANGUAGES
            // =====================================================

            // Delete old languages

            DB::delete(
                "DELETE FROM teacher_profile_language
                 WHERE teacher_profile_id = ?",
                [$teacherProfileId]
            );


            // Insert new languages

            if (!empty($validated['languages'])) {

                foreach ($validated['languages'] as $languageId) {

                    DB::insert(
                        "INSERT INTO teacher_profile_language
                        (
                            teacher_profile_id,
                            language_id,
                            created_at,
                            updated_at
                        )

                        VALUES (?, ?, ?, ?)",
                        [
                            $teacherProfileId,
                            $languageId,
                            now(),
                            now()
                        ]
                    );
                }
            }


            // =====================================================
            // COMMIT
            // =====================================================

            DB::commit();


            // =====================================================
            // GET UPDATED PROFILE
            // =====================================================

            $updatedProfile = DB::selectOne(
                "SELECT
                    users.id AS user_id,
                    users.name,
                    users.email,

                    teacher_profiles.id AS teacher_profile_id,
                    teacher_profiles.phone,
                    teacher_profiles.location,
                    teacher_profiles.date_of_birth,
                    teacher_profiles.gender,
                    teacher_profiles.qualification,
                    teacher_profiles.teaching_experience,
                    teacher_profiles.hourly_rate,
                    teacher_profiles.institution,
                    teacher_profiles.certification,
                    teacher_profiles.bio,
                    teacher_profiles.availability,
                    teacher_profiles.tutoring_mode,
                    teacher_profiles.time_zone,
                    teacher_profiles.profile_image

                 FROM users

                 LEFT JOIN teacher_profiles
                    ON users.id = teacher_profiles.user_id

                 WHERE users.id = ?",
                [$user->id]
            );


            // =====================================================
            // GET UPDATED SUBJECTS
            // =====================================================

            $subjects = DB::select(
                "SELECT
                    subjects.id,
                    subjects.subject_name

                 FROM teacher_profile_subject

                 INNER JOIN subjects
                    ON teacher_profile_subject.subject_id = subjects.id

                 WHERE teacher_profile_subject.teacher_profile_id = ?

                 ORDER BY subjects.subject_name ASC",
                [$teacherProfileId]
            );


            // =====================================================
            // GET UPDATED LANGUAGES
            // =====================================================

            $languages = DB::select(
                "SELECT
                    languages.id,
                    languages.language_name

                 FROM teacher_profile_language

                 INNER JOIN languages
                    ON teacher_profile_language.language_id = languages.id

                 WHERE teacher_profile_language.teacher_profile_id = ?

                 ORDER BY languages.language_name ASC",
                [$teacherProfileId]
            );


            // =====================================================
            // IMAGE URL
            // =====================================================

            if (
                $updatedProfile &&
                $updatedProfile->profile_image
            ) {
                $updatedProfile->profile_image_url =
                    $request->getSchemeAndHttpHost()
                    . '/'
                    . $updatedProfile->profile_image;
            } else {
                $updatedProfile->profile_image_url = null;
            }


            return response()->json([
                'message' =>
                    'Teacher profile updated successfully.',

                'profile' =>
                    $updatedProfile,

                'subjects' =>
                    $subjects,

                'languages' =>
                    $languages
            ], 200);


        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'message' =>
                    'Failed to save teacher profile.',

                'error' =>
                    $e->getMessage()
            ], 500);
        }
    }


    // =========================================================
    // UPLOAD PROFILE IMAGE - 5MB
    // =========================================================

    public function uploadImage(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }


        // 5120 KB = 5 MB

        $request->validate([
            'image' =>
                'required|image|mimes:jpg,jpeg,png,gif|max:5120'
        ]);


        try {

            // -----------------------------------------------------
            // FIND TEACHER PROFILE
            // -----------------------------------------------------

            $profile = DB::selectOne(
                "SELECT id, profile_image
                 FROM teacher_profiles
                 WHERE user_id = ?",
                [$user->id]
            );


            // -----------------------------------------------------
            // CREATE PROFILE IF NOT EXISTS
            // -----------------------------------------------------

            if (!$profile) {

                DB::insert(
                    "INSERT INTO teacher_profiles
                    (
                        user_id,
                        created_at,
                        updated_at
                    )

                    VALUES (?, ?, ?)",
                    [
                        $user->id,
                        now(),
                        now()
                    ]
                );


                $profile = DB::selectOne(
                    "SELECT id, profile_image
                     FROM teacher_profiles
                     WHERE user_id = ?",
                    [$user->id]
                );
            }


            // -----------------------------------------------------
            // DELETE OLD IMAGE
            // -----------------------------------------------------

            if (
                $profile->profile_image &&
                file_exists(
                    public_path($profile->profile_image)
                )
            ) {
                unlink(
                    public_path($profile->profile_image)
                );
            }


            // -----------------------------------------------------
            // CREATE UPLOAD DIRECTORY
            // -----------------------------------------------------

            $uploadPath =
                public_path('uploads/teacher-profiles');


            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }


            // -----------------------------------------------------
            // GET FILE
            // -----------------------------------------------------

            $file = $request->file('image');


            $fileName =
                time()
                . '_'
                . uniqid()
                . '.'
                . $file->getClientOriginalExtension();


            // -----------------------------------------------------
            // MOVE IMAGE
            // -----------------------------------------------------

            $file->move(
                $uploadPath,
                $fileName
            );


            // -----------------------------------------------------
            // IMAGE PATH
            // -----------------------------------------------------

            $imagePath =
                'uploads/teacher-profiles/'
                . $fileName;


            // -----------------------------------------------------
            // SAVE IMAGE PATH USING RAW SQL
            // -----------------------------------------------------

            DB::update(
                "UPDATE teacher_profiles
                 SET
                    profile_image = ?,
                    updated_at = ?

                 WHERE id = ?",
                [
                    $imagePath,
                    now(),
                    $profile->id
                ]
            );


            return response()->json([
                'message' =>
                    'Profile picture uploaded successfully.',

                'image' =>
                    $imagePath
            ], 200);


        } catch (\Throwable $e) {

            return response()->json([
                'message' =>
                    'Failed to upload profile picture.',

                'error' =>
                    $e->getMessage()
            ], 500);
        }
    }
}