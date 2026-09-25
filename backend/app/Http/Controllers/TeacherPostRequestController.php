<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherPostRequestController extends Controller
{
    // Teacher sends request for a student post
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'teacher') {
            return response()->json([
                'message' => 'Only teachers can send requests.'
            ], 403);
        }

        $validated = $request->validate([
            'tutor_post_id' => [
                'required',
                'integer',
                'exists:student_tutor_posts,id'
            ]
        ]);

        // Find the selected student post
        $post = DB::selectOne(
            "
            SELECT id, student_id
            FROM student_tutor_posts
            WHERE id = ?
            LIMIT 1
            ",
            [$validated['tutor_post_id']]
        );

        if (!$post) {
            return response()->json([
                'message' => 'Student post not found.'
            ], 404);
        }

        // Prevent duplicate active request
        $existingRequest = DB::selectOne(
            "
            SELECT id, status
            FROM teacher_post_requests
            WHERE tutor_post_id = ?
              AND teacher_id = ?
              AND status IN ('pending', 'accepted')
            LIMIT 1
            ",
            [
                $post->id,
                $user->id
            ]
        );

        if ($existingRequest) {
            return response()->json([
                'message' => 'You already sent a request for this post.',
                'status' => $existingRequest->status
            ], 422);
        }

        try {
            DB::beginTransaction();

            DB::insert(
                "
                INSERT INTO teacher_post_requests
                (
                    tutor_post_id,
                    teacher_id,
                    student_id,
                    status,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, 'pending', NOW(), NOW())
                ",
                [
                    $post->id,
                    $user->id,
                    $post->student_id
                ]
            );

            $requestId = DB::getPdo()->lastInsertId();

            DB::commit();

            return response()->json([
                'message' => 'Request sent successfully.',
                'request' => [
                    'id' => (int) $requestId,
                    'tutor_post_id' => (int) $post->id,
                    'teacher_id' => (int) $user->id,
                    'student_id' => (int) $post->student_id,
                    'status' => 'pending'
                ]
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to send request.'
            ], 500);
        }
    }

    // Teacher sees requests already sent
    public function teacherRequests(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'teacher') {
            return response()->json([
                'message' => 'Only teachers can access these requests.'
            ], 403);
        }

        $requests = DB::select(
            "
            SELECT
                id,
                tutor_post_id,
                teacher_id,
                student_id,
                status,
                created_at,
                updated_at
            FROM teacher_post_requests
            WHERE teacher_id = ?
            ORDER BY created_at DESC
            ",
            [$user->id]
        );

        return response()->json([
            'requests' => $requests
        ]);
    }
}
