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

        // Check login
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Only student can access
        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'Only students can access this profile.',
            ], 403);
        }

        // =====================================================
        // LEFT JOIN
        // users + student_profiles
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
        // RESPONSE
        // =====================================================

        return response()->json([
            'message' => 'Student profile retrieved successfully.',
            'profile' => $profile,
        ]);
    }


    // =========================================================
    // UPDATE STUDENT PROFILE
    // =========================================================

    public function update(Request $request)
    {
        $user = $request->user();

        // Check login
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Only student can update
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

        ]);


        // =====================================================
        // START TRANSACTION
        // =====================================================

        DB::beginTransaction();

        try {

            // =================================================
            // UPDATE USERS TABLE
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
                SELECT
                    id,
                    profile_image

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
            // UPDATE EXISTING PROFILE
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

                // =================================================
                // INSERT NEW PROFILE
                // =================================================

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

                    VALUES
                    (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?,
                        NOW(),
                        NOW()
                    )
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
            }


            // =================================================
            // SAVE ALL CHANGES
            // =================================================

            DB::commit();


            // =================================================
            // GET UPDATED PROFILE USING LEFT JOIN
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


            // =================================================
            // PROFILE IMAGE URL
            // =================================================

            $imageUrl = null;


            if ($profile && $profile->profile_image) {

                $imageUrl =
                    $request->getSchemeAndHttpHost()
                    . '/storage/'
                    . $profile->profile_image;
            }


            // =================================================
            // SUCCESS RESPONSE
            // =================================================

            return response()->json([

                'message' =>
                    'Profile updated successfully!',

                'profile' =>
                    $profile,

                'profile_image_url' =>
                    $imageUrl,

            ]);


        } catch (\Throwable $e) {

            // =================================================
            // ERROR - CANCEL DATABASE CHANGES
            // =================================================

            DB::rollBack();


            return response()->json([

                'message' =>
                    'Profile update failed.',

                'error' =>
                    $e->getMessage(),

            ], 500);
        }
    }
}