<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TuitionRequestController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | 1. STUDENT SENDS REQUEST
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'Only students can send tutor requests.'
            ], 403);
        }

        $request->validate([
            'teacher_profile_id' =>
                'required|integer|exists:teacher_profiles,id'
        ]);

        DB::beginTransaction();

        try {

            /*
            ----------------------------------------------------------
            DUPLICATE CHECK
            ----------------------------------------------------------
            */

            $existingRequest = DB::selectOne(
                "
                SELECT id
                FROM tuition_requests

                WHERE student_id = ?
                AND teacher_profile_id = ?
                AND status IN ('pending', 'accepted')

                LIMIT 1
                ",
                [
                    $user->id,
                    $request->teacher_profile_id
                ]
            );

            if ($existingRequest) {

                DB::rollBack();

                return response()->json([
                    'message' =>
                        'You already have an active request with this teacher.'
                ], 422);
            }

            /*
            ----------------------------------------------------------
            INSERT REQUEST
            ----------------------------------------------------------
            */

            DB::insert(
                "
                INSERT INTO tuition_requests
                (
                    student_id,
                    teacher_profile_id,
                    status,
                    is_read,
                    created_at,
                    updated_at
                )

                VALUES
                (?, ?, 'pending', 0, NOW(), NOW())
                ",
                [
                    $user->id,
                    $request->teacher_profile_id
                ]
            );

            $tuitionRequestId =
                DB::getPdo()->lastInsertId();

            /*
            ----------------------------------------------------------
            INSERT NOTIFICATION
            ----------------------------------------------------------
            */

            DB::insert(
                "
                INSERT INTO tutor_request_notifications
                (
                    tuition_request_id,
                    student_id,
                    teacher_profile_id,
                    message,
                    is_read,
                    created_at,
                    updated_at
                )

                VALUES
                (?, ?, ?, ?, 0, NOW(), NOW())
                ",
                [
                    $tuitionRequestId,
                    $user->id,
                    $request->teacher_profile_id,
                    $user->name . ' sent you a tutor request.'
                ]
            );

            DB::commit();

            return response()->json([
                'message' =>
                    'Tutor request sent successfully.',

                'status' => 'pending'
            ], 201);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Request failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | 2. STUDENT GETS OWN REQUESTS
    |--------------------------------------------------------------------------
    */

    public function studentRequests(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'student') {
            return response()->json([
                'message' =>
                    'Only students can view their requests.'
            ], 403);
        }

        /*
        ----------------------------------------------------------
        Latest requests first.

        Same teacher-এর একাধিক history থাকতে পারে:

        rejected
        ↓
        student আবার request দেয়
        ↓
        pending
        ----------------------------------------------------------
        */

        $requests = DB::select(
            "
            SELECT
                id,
                student_id,
                teacher_profile_id,
                status,
                created_at,
                updated_at

            FROM tuition_requests

            WHERE student_id = ?

            ORDER BY id DESC
            ",
            [$user->id]
        );

        return response()->json([
            'requests' => $requests
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | 3. TEACHER GETS OWN REQUESTS
    |--------------------------------------------------------------------------
    */

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
                'message' =>
                    'Only teachers can view requests.'
            ], 403);
        }

        /*
        ----------------------------------------------------------
        GET TEACHER PROFILE ID
        ----------------------------------------------------------
        */

        $teacher = DB::selectOne(
            "
            SELECT id
            FROM teacher_profiles

            WHERE user_id = ?

            LIMIT 1
            ",
            [$user->id]
        );

        if (!$teacher) {
            return response()->json([
                'message' =>
                    'Teacher profile not found.'
            ], 404);
        }

        /*
        ----------------------------------------------------------
        GET REQUEST + STUDENT INFO
        ----------------------------------------------------------
        */

        $requests = DB::select(
            "
            SELECT
                tr.id,
                tr.student_id,
                tr.teacher_profile_id,
                tr.status,
                tr.created_at,
                tr.updated_at,

                u.name AS student_name,
                u.email AS student_email

            FROM tuition_requests AS tr

            INNER JOIN users AS u
                ON tr.student_id = u.id

            WHERE tr.teacher_profile_id = ?

            ORDER BY tr.created_at DESC
            ",
            [$teacher->id]
        );

        return response()->json([
            'requests' => $requests
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | 4. TEACHER ACCEPTS / REJECTS REQUEST
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'teacher') {
            return response()->json([
                'message' => 'Forbidden.'
            ], 403);
        }

        $request->validate([
            'status' =>
                'required|in:accepted,rejected'
        ]);

        /*
        ----------------------------------------------------------
        GET TEACHER PROFILE
        ----------------------------------------------------------
        */

        $teacher = DB::selectOne(
            "
            SELECT id
            FROM teacher_profiles

            WHERE user_id = ?

            LIMIT 1
            ",
            [$user->id]
        );

        if (!$teacher) {
            return response()->json([
                'message' =>
                    'Teacher profile not found.'
            ], 404);
        }

        /*
        ----------------------------------------------------------
        GET REQUEST
        ----------------------------------------------------------
        */

        $tuitionRequest = DB::selectOne(
            "
            SELECT
                id,
                status

            FROM tuition_requests

            WHERE id = ?
            AND teacher_profile_id = ?

            LIMIT 1
            ",
            [
                $id,
                $teacher->id
            ]
        );

        if (!$tuitionRequest) {
            return response()->json([
                'message' =>
                    'Request not found.'
            ], 404);
        }

        /*
        ----------------------------------------------------------
        ONLY PENDING REQUEST CAN BE ACCEPTED / REJECTED
        ----------------------------------------------------------
        */

        if ($tuitionRequest->status !== 'pending') {
            return response()->json([
                'message' =>
                    'This request has already been decided.'
            ], 422);
        }

        /*
        ----------------------------------------------------------
        UPDATE STATUS
        ----------------------------------------------------------
        */

        DB::update(
            "
            UPDATE tuition_requests

            SET
                status = ?,
                updated_at = NOW()

            WHERE id = ?
            AND teacher_profile_id = ?
            ",
            [
                $request->status,
                $id,
                $teacher->id
            ]
        );

        return response()->json([
            'message' =>
                'Request status updated successfully.',

            'status' =>
                $request->status
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | 5. GET TEACHER NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    public function notifications(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'teacher') {
            return response()->json([
                'message' => 'Forbidden.'
            ], 403);
        }

        $teacher = DB::selectOne(
            "
            SELECT id
            FROM teacher_profiles

            WHERE user_id = ?

            LIMIT 1
            ",
            [$user->id]
        );

        if (!$teacher) {
            return response()->json([
                'message' =>
                    'Teacher profile not found.'
            ], 404);
        }

        /*
        ----------------------------------------------------------
        GET ALL NOTIFICATIONS

        read + unread দুটোই থাকবে
        ----------------------------------------------------------
        */

        $notifications = DB::select(
            "
            SELECT
                n.id,
                n.tuition_request_id,
                n.student_id,
                n.teacher_profile_id,
                n.message,
                n.is_read,
                n.created_at,
                n.updated_at,

                u.name AS student_name

            FROM tutor_request_notifications AS n

            INNER JOIN users AS u
                ON n.student_id = u.id

            WHERE n.teacher_profile_id = ?

            ORDER BY n.created_at DESC
            ",
            [$teacher->id]
        );

        /*
        ----------------------------------------------------------
        ONLY UNREAD COUNT
        ----------------------------------------------------------
        */

        $unread = DB::selectOne(
            "
            SELECT COUNT(*) AS total

            FROM tutor_request_notifications

            WHERE teacher_profile_id = ?
            AND is_read = 0
            ",
            [$teacher->id]
        );

        return response()->json([
            'unread_count' =>
                (int) $unread->total,

            'notifications' =>
                $notifications
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | 6. MARK NOTIFICATIONS READ
    |--------------------------------------------------------------------------
    */

    public function markNotificationsRead(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'teacher') {
            return response()->json([
                'message' => 'Forbidden.'
            ], 403);
        }

        $teacher = DB::selectOne(
            "
            SELECT id
            FROM teacher_profiles

            WHERE user_id = ?

            LIMIT 1
            ",
            [$user->id]
        );

        if (!$teacher) {
            return response()->json([
                'message' =>
                    'Teacher profile not found.'
            ], 404);
        }

        DB::update(
            "
            UPDATE tutor_request_notifications

            SET
                is_read = 1,
                updated_at = NOW()

            WHERE teacher_profile_id = ?
            AND is_read = 0
            ",
            [$teacher->id]
        );

        return response()->json([
            'message' =>
                'Notifications marked as read.'
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | 7. DELETE ONE NOTIFICATION
    |--------------------------------------------------------------------------
    */

    public function deleteNotification(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->role !== 'teacher') {
            return response()->json([
                'message' => 'Forbidden.'
            ], 403);
        }

        $teacher = DB::selectOne(
            "
            SELECT id
            FROM teacher_profiles

            WHERE user_id = ?

            LIMIT 1
            ",
            [$user->id]
        );

        if (!$teacher) {
            return response()->json([
                'message' =>
                    'Teacher profile not found.'
            ], 404);
        }

        /*
        ----------------------------------------------------------
        CHECK NOTIFICATION BELONGS TO TEACHER
        ----------------------------------------------------------
        */

        $notification = DB::selectOne(
            "
            SELECT id

            FROM tutor_request_notifications

            WHERE id = ?
            AND teacher_profile_id = ?

            LIMIT 1
            ",
            [
                $id,
                $teacher->id
            ]
        );

        if (!$notification) {
            return response()->json([
                'message' =>
                    'Notification not found.'
            ], 404);
        }

        /*
        ----------------------------------------------------------
        DELETE NOTIFICATION ONLY

        Tutor request delete হবে না.
        ----------------------------------------------------------
        */

        DB::delete(
            "
            DELETE FROM tutor_request_notifications

            WHERE id = ?
            AND teacher_profile_id = ?
            ",
            [
                $id,
                $teacher->id
            ]
        );

        return response()->json([
            'message' =>
                'Notification deleted successfully.'
        ]);
    }
}