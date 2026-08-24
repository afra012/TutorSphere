<?php

namespace App\Http\Controllers;

use App\Models\TeacherProfile;
use App\Models\Subject;
use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherProfileController extends Controller
{
    // =========================================================
    // Subjects
    // =========================================================

    public function subjects()
    {
        $subjects = Subject::orderBy('subject_name', 'asc')->get([
            'id',
            'subject_name'
        ]);

        return response()->json([
            'subjects' => $subjects
        ]);
    }

    // =========================================================
    // Languages
    // =========================================================

    public function languages()
    {
        $languages = Language::orderBy('language_name', 'asc')->get([
            'id',
            'language_name'
        ]);

        return response()->json([
            'languages' => $languages
        ]);
    }

    // =========================================================
    // Show Teacher Profile
    // =========================================================

    public function show(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $profile = TeacherProfile::with([
            'user',
            'subjects',
            'languages'
        ])
            ->where('user_id', $user->id)
            ->first();

        if (!$profile) {
            return response()->json([
                'profile' => null
            ], 404);
        }

        return response()->json([
            'profile' => $profile
        ]);
    }

    // =========================================================
    // Update Teacher Profile
    // =========================================================

    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

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
            // Update User
            $user->name = $validated['fullName'];
            $user->email = $validated['email'];
            $user->save();

            // Create / Update Teacher Profile
            $profile = TeacherProfile::firstOrNew([
                'user_id' => $user->id
            ]);

            $profile->phone = $validated['phone'] ?? null;
            $profile->location = $validated['location'] ?? null;
            $profile->date_of_birth = $validated['birthDate'] ?? null;
            $profile->gender = $validated['gender'] ?? null;

            $profile->qualification =
                $validated['qualification'] ?? null;

            $profile->teaching_experience =
                $validated['experience'] ?? null;

            $profile->hourly_rate =
                $validated['hourlyRate'] ?? null;

            $profile->institution =
                $validated['institution'] ?? null;

            $profile->certification =
                $validated['certification'] ?? null;

            $profile->bio =
                $validated['bio'] ?? null;

            $profile->availability =
                $validated['availability'] ?? null;

            $profile->tutoring_mode =
                $validated['tutoringMode'] ?? null;

            $profile->time_zone =
                $validated['timeZone'] ?? null;

            $profile->save();

            // Save Subjects
            $profile->subjects()->sync(
                $validated['subjects'] ?? []
            );

            // Save Languages
            $profile->languages()->sync(
                $validated['languages'] ?? []
            );

            // Reload
            $profile->load([
                'user',
                'subjects',
                'languages'
            ]);

            DB::commit();

            return response()->json([
                'message' =>
                    'Teacher profile updated successfully.',
                'profile' => $profile
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
    // Upload Profile Image
    // =========================================================

    public function uploadImage(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $request->validate([
            'image' =>
                'required|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        try {

            $profile = TeacherProfile::firstOrNew([
                'user_id' => $user->id
            ]);

            // Delete old image
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

            // Upload directory
            $uploadPath =
                public_path('uploads/teacher-profiles');

            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }

            // File
            $file = $request->file('image');

            $fileName =
                time() .
                '_' .
                uniqid() .
                '.' .
                $file->getClientOriginalExtension();

            // Move
            $file->move(
                $uploadPath,
                $fileName
            );

            // Save path
            $profile->profile_image =
                'uploads/teacher-profiles/' . $fileName;

            $profile->save();

            return response()->json([
                'message' =>
                    'Profile picture uploaded successfully.',
                'image' =>
                    $profile->profile_image,
                'profile' =>
                    $profile
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