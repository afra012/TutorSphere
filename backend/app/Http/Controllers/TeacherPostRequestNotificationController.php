<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherPostRequestNotificationController extends Controller
{
    // Student-এর সব teacher request notification দেখাবে
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'Only students can access these notifications.'
            ], 403);
        }

        $notifications = DB::select(
            "
            SELECT
                n.id AS notification_id,
                n.teacher_post_request_id,
                n.student_id,
                n.message,
                n.is_read,
                n.created_at,

                r.teacher_id,
                r.tutor_post_id,
                r.status AS request_status,

                tp.id AS teacher_profile_id,
                tp.phone,
                tp.location,
                tp.qualification,
                tp.teaching_experience,
                tp.hourly_rate,
                tp.institution,
                tp.certification,
                tp.bio,
                tp.availability,
                tp.tutoring_mode,
                tp.time_zone,
                tp.profile_image

            FROM teacher_post_request_notifications n

            INNER JOIN teacher_post_requests r
                ON n.teacher_post_request_id = r.id

            LEFT JOIN teacher_profiles tp
                ON r.teacher_id = tp.user_id

            WHERE n.student_id = ?

            ORDER BY n.created_at DESC
            ",
            [$user->id]
        );

        return response()->json([
            'notifications' => $notifications
        ]);
    }

    // Notification read করবে
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'Only students can update notifications.'
            ], 403);
        }

        $notification = DB::selectOne(
            "
            SELECT id
            FROM teacher_post_request_notifications
            WHERE id = ?
              AND student_id = ?
            LIMIT 1
            ",
            [
                $id,
                $user->id
            ]
        );

        if (!$notification) {
            return response()->json([
                'message' => 'Notification not found.'
            ], 404);
        }

        DB::update(
            "
            UPDATE teacher_post_request_notifications
            SET is_read = 1,
                updated_at = NOW()
            WHERE id = ?
            ",
            [$id]
        );

        return response()->json([
            'message' => 'Notification marked as read.'
        ]);
    }

    // Student Accept / Reject করবে
    public function respond(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'Only students can respond to requests.'
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:accepted,rejected'
            ]
        ]);

        $notification = DB::selectOne(
            "
            SELECT
                n.id AS notification_id,
                n.teacher_post_request_id,
                r.status AS request_status
            FROM teacher_post_request_notifications n

            INNER JOIN teacher_post_requests r
                ON n.teacher_post_request_id = r.id

            WHERE n.id = ?
              AND n.student_id = ?
              AND r.student_id = ?

            LIMIT 1
            ",
            [
                $id,
                $user->id,
                $user->id
            ]
        );

        if (!$notification) {
            return response()->json([
                'message' => 'Request not found.'
            ], 404);
        }

        if ($notification->request_status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been responded to.',
                'status' => $notification->request_status
            ], 422);
        }

        try {
            DB::beginTransaction();

            DB::update(
                "
                UPDATE teacher_post_requests
                SET status = ?,
                    updated_at = NOW()
                WHERE id = ?
                ",
                [
                    $validated['status'],
                    $notification->teacher_post_request_id
                ]
            );

            DB::update(
                "
                UPDATE teacher_post_request_notifications
                SET is_read = 1,
                    updated_at = NOW()
                WHERE id = ?
                ",
                [$notification->notification_id]
            );

            DB::commit();

            return response()->json([
                'message' => $validated['status'] === 'accepted'
                    ? 'Request accepted successfully.'
                    : 'Request rejected successfully.',

                'status' => $validated['status']
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to update request.'
            ], 500);
        }
    }
}