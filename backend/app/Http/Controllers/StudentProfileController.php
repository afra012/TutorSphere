<?php

namespace App\Http\Controllers;

use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StudentProfileController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET STUDENT PROFILE
    |--------------------------------------------------------------------------
    */

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

        /*
        |--------------------------------------------------------------------------
        | LEFT JOIN
        |--------------------------------------------------------------------------
        */

        $profile = DB::table('users')
            ->leftJoin(
                'student_profiles',
                'users.id',
                '=',
                'student_profiles.user_id'
            )
            ->where('users.id', $user->id)
            ->select(
                'users.id as user_id',
                'users.name',
                'users.email',
                'student_profiles.profile_image',
                'student_profiles.phone',
                'student_profiles.address',
                'student_profiles.education_level',
                'student_profiles.institution',
                'student_profiles.class_grade',
                'student_profiles.preferred_time',
                'student_profiles.about_me'
            )
            ->first();

        /*
        |--------------------------------------------------------------------------
        | PROFILE IMAGE URL
        |--------------------------------------------------------------------------
        */

        if ($profile && $profile->profile_image) {
            $profile->profile_image_url =
                $request->getSchemeAndHttpHost()
                . '/storage/'
                . $profile->profile_image;
        } elseif ($profile) {
            $profile->profile_image_url = null;
        }

        /*
        |--------------------------------------------------------------------------
        | MULTIPLE TABLE JOIN
        |--------------------------------------------------------------------------
        */

        $subjects = DB::table('users')
            ->join(
                'student_subjects',
                'users.id',
                '=',
                'student_subjects.student_id'
            )
            ->join(
                'subjects',
                'student_subjects.subject_id',
                '=',
                'subjects.id'
            )
            ->where('users.id', $user->id)
            ->select(
                'subjects.id',
                'subjects.subject_name'
            )
            ->get();

        return response()->json([
            'message' => 'Student profile retrieved successfully.',
            'profile' => $profile,
            'subjects' => $subjects,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE STUDENT PROFILE
    |--------------------------------------------------------------------------
    */

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

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

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

            /*
            |--------------------------------------------------------------------------
            | UPDATE USERS TABLE
            |--------------------------------------------------------------------------
            */

            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            /*
            |--------------------------------------------------------------------------
            | GET EXISTING PROFILE OR CREATE NEW
            |--------------------------------------------------------------------------
            */

            $profile = StudentProfile::firstOrNew([
                'user_id' => $user->id,
            ]);

            $profile->phone =
                $validated['phone'] ?? null;

            $profile->address =
                $validated['address'] ?? null;

            $profile->education_level =
                $validated['education_level'] ?? null;

            $profile->institution =
                $validated['institution'] ?? null;

            $profile->class_grade =
                $validated['class_grade'] ?? null;

            $profile->preferred_time =
                $validated['preferred_time'] ?? null;

            $profile->about_me =
                $validated['about_me'] ?? null;

            /*
            |--------------------------------------------------------------------------
            | PROFILE IMAGE
            |--------------------------------------------------------------------------
            */

            if ($request->hasFile('profile_image')) {

                $image = $request->file('profile_image');

                /*
                 * Delete old image if one exists
                 */
                if (
                    $profile->profile_image &&
                    Storage::disk('public')->exists(
                        $profile->profile_image
                    )
                ) {
                    Storage::disk('public')->delete(
                        $profile->profile_image
                    );
                }

                /*
                 * Save new image
                 */
                $imagePath = $image->store(
                    'student_profiles',
                    'public'
                );

                /*
                 * Save path in MySQL
                 */
                $profile->profile_image =
                    $imagePath;
            }

            /*
            |--------------------------------------------------------------------------
            | SAVE STUDENT PROFILE
            |--------------------------------------------------------------------------
            */

            $profile->save();

            /*
            |--------------------------------------------------------------------------
            | SUBJECTS
            |--------------------------------------------------------------------------
            */

            if ($request->has('subject_ids')) {
                $user->subjects()->sync(
                    $validated['subject_ids'] ?? []
                );
            }

            DB::commit();

            /*
            |--------------------------------------------------------------------------
            | IMAGE URL
            |--------------------------------------------------------------------------
            */

            $imageUrl = null;

            if ($profile->profile_image) {
                $imageUrl =
                    $request->getSchemeAndHttpHost()
                    . '/storage/'
                    . $profile->profile_image;
            }

            return response()->json([
                'message' =>
                    'Profile updated successfully!',

                'profile' => $profile,

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


    /*
    |--------------------------------------------------------------------------
    | SUBJECTS
    |--------------------------------------------------------------------------
    */

    public function subjects()
    {
        $subjects = DB::table('subjects')
            ->select(
                'id',
                'subject_name'
            )
            ->orderBy('subject_name')
            ->get();

        return response()->json([
            'subjects' => $subjects,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | INNER JOIN
    |--------------------------------------------------------------------------
    */

    public function innerJoin(Request $request)
    {
        $user = $request->user();

        $profile = DB::table('users')
            ->join(
                'student_profiles',
                'users.id',
                '=',
                'student_profiles.user_id'
            )
            ->where(
                'users.id',
                $user->id
            )
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'student_profiles.phone',
                'student_profiles.address'
            )
            ->first();

        return response()->json([
            'profile' => $profile,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | RIGHT JOIN
    |--------------------------------------------------------------------------
    */

    public function rightJoin(Request $request)
    {
        $user = $request->user();

        $profile = DB::table('users')
            ->rightJoin(
                'student_profiles',
                'users.id',
                '=',
                'student_profiles.user_id'
            )
            ->where(
                'users.id',
                $user->id
            )
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'student_profiles.phone',
                'student_profiles.address'
            )
            ->first();

        return response()->json([
            'profile' => $profile,
        ]);
    }
}