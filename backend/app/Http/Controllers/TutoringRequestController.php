<?php

namespace App\Http\Controllers;

use App\Models\TutoringRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TutoringRequestController extends Controller
{
    // =========================================================
    // LIST REQUESTS
    // =========================================================
    //
    // GET /api/tutoring-requests
    //
    // student -> requests the student has sent
    // teacher -> requests the teacher has received
    // =========================================================

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'student') {
            $requests = TutoringRequest::with('teacher:id,name')
                ->where('student_id', $user->id)
                ->latest()
                ->get()
                ->map(fn (TutoringRequest $r) => $this->formatForStudent($r))
                ->values();

            return response()->json(['requests' => $requests]);
        }

        if ($user->role === 'teacher') {
            $requests = TutoringRequest::with(['student:id,name,email', 'student.studentProfile'])
                ->where('teacher_id', $user->id)
                ->latest()
                ->get()
                ->map(fn (TutoringRequest $r) => $this->formatForTeacher($r))
                ->values();

            return response()->json(['requests' => $requests]);
        }

        abort(403, 'Only students and teachers can view tutoring requests.');
    }


    // =========================================================
    // SEND A REQUEST (student -> tutor)
    // =========================================================
    //
    // POST /api/tutoring-requests
    // body: { teacher_id, message? }
    //
    // 409 if the student already has a pending/accepted request
    // with this tutor (the frontend relies on this status code).
    // =========================================================

    public function store(Request $request): JsonResponse
    {
        $student = $request->user();

        abort_unless($student->role === 'student', 403, 'Only students can send tutoring requests.');

        $data = $request->validate([
            'teacher_id' => 'required|integer',
            'message' => 'nullable|string|max:1000',
        ]);

        $teacher = User::where('id', $data['teacher_id'])
            ->where('role', 'teacher')
            ->first();

        if (!$teacher) {
            return response()->json(['message' => 'Tutor not found.'], 404);
        }

        $tutoringRequest = DB::transaction(function () use ($student, $teacher, $data) {
            $alreadyActive = TutoringRequest::where('student_id', $student->id)
                ->where('teacher_id', $teacher->id)
                ->whereIn('status', TutoringRequest::ACTIVE_STATUSES)
                ->lockForUpdate()
                ->exists();

            if ($alreadyActive) {
                return null;
            }

            return TutoringRequest::create([
                'student_id' => $student->id,
                'teacher_id' => $teacher->id,
                'status' => TutoringRequest::STATUS_PENDING,
                'message' => $data['message'] ?? null,
            ]);
        });

        if (!$tutoringRequest) {
            return response()->json([
                'message' => 'You already have an active request with this tutor.',
            ], 409);
        }

        return response()->json([
            'message' => 'Request sent successfully.',
            'request' => $this->formatForStudent($tutoringRequest->load('teacher:id,name')),
        ], 201);
    }


    // =========================================================
    // CHANGE STATUS
    // =========================================================
    //
    // PATCH /api/tutoring-requests/{id}/status
    // body: { status }
    //
    // teacher -> accepted | rejected  (only while pending)
    // student -> cancelled            (while pending / accepted)
    // =========================================================

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'status' => ['required', Rule::in([
                TutoringRequest::STATUS_ACCEPTED,
                TutoringRequest::STATUS_REJECTED,
                TutoringRequest::STATUS_CANCELLED,
            ])],
        ]);

        $tutoringRequest = TutoringRequest::findOrFail($id);

        if ($user->role === 'teacher') {
            abort_unless((int) $tutoringRequest->teacher_id === (int) $user->id, 403, 'This request was not sent to you.');
            abort_unless(
                in_array($data['status'], [TutoringRequest::STATUS_ACCEPTED, TutoringRequest::STATUS_REJECTED], true),
                403,
                'Teachers can only accept or reject requests.'
            );

            if ($tutoringRequest->status !== TutoringRequest::STATUS_PENDING) {
                return response()->json(['message' => 'This request has already been answered.'], 422);
            }
        } elseif ($user->role === 'student') {
            abort_unless((int) $tutoringRequest->student_id === (int) $user->id, 403, 'This is not your request.');
            abort_unless(
                $data['status'] === TutoringRequest::STATUS_CANCELLED,
                403,
                'Students can only cancel their requests.'
            );

            if (!in_array($tutoringRequest->status, TutoringRequest::ACTIVE_STATUSES, true)) {
                return response()->json(['message' => 'This request is no longer active.'], 422);
            }
        } else {
            abort(403, 'Not allowed.');
        }

        $tutoringRequest->update([
            'status' => $data['status'],
            'responded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Request updated.',
            'request' => $user->role === 'teacher'
                ? $this->formatForTeacher($tutoringRequest->load(['student:id,name,email', 'student.studentProfile']))
                : $this->formatForStudent($tutoringRequest->load('teacher:id,name')),
        ]);
    }


    // =========================================================
    // RESPONSE SHAPES
    // =========================================================

    private function formatForStudent(TutoringRequest $r): array
    {
        return [
            'id' => $r->id,
            'teacher_id' => $r->teacher_id,
            'teacher_name' => $r->teacher?->name,
            'status' => $r->status,
            'message' => $r->message,
            'created_at' => $r->created_at?->toIso8601String(),
        ];
    }

    private function formatForTeacher(TutoringRequest $r): array
    {
        $profile = $r->student?->studentProfile;

        // Contact details are only shared once the teacher has accepted.
        $accepted = $r->status === TutoringRequest::STATUS_ACCEPTED;

        return [
            'id' => $r->id,
            'student_id' => $r->student_id,
            'student_name' => $r->student?->name,
            'status' => $r->status,
            'message' => $r->message,
            'location' => $profile?->address,
            'education_level' => $profile?->education_level,
            'class_grade' => $profile?->class_grade,
            'student_email' => $accepted ? $r->student?->email : null,
            'student_phone' => $accepted ? $profile?->phone : null,
            'created_at' => $r->created_at?->toIso8601String(),
        ];
    }
}
