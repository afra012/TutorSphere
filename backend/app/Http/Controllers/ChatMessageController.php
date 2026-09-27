<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatMessageController extends Controller
{
    public function index(Request $request, int $userId): JsonResponse
    {
        $currentUser = $request->user();
        $otherUser = User::findOrFail($userId);

        $this->authorizeConversation($currentUser, $otherUser);

        ChatMessage::query()
            ->where('sender_id', $otherUser->id)
            ->where('receiver_id', $currentUser->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = ChatMessage::query()
            ->where(function ($query) use ($currentUser, $otherUser) {
                $query->where('sender_id', $currentUser->id)
                    ->where('receiver_id', $otherUser->id);
            })
            ->orWhere(function ($query) use ($currentUser, $otherUser) {
                $query->where('sender_id', $otherUser->id)
                    ->where('receiver_id', $currentUser->id);
            })
            ->orderBy('created_at')
            ->orderBy('id')
            ->get(['id', 'sender_id', 'receiver_id', 'body', 'created_at']);

        return response()->json(['messages' => $messages]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        $messages = DB::table('chat_messages as messages')
            ->join('users as senders', 'senders.id', '=', 'messages.sender_id')
            ->where('messages.receiver_id', $currentUser->id)
            ->whereNull('messages.read_at')
            ->orderByDesc('messages.created_at')
            ->get([
                'messages.sender_id',
                'senders.name as sender_name',
                'messages.body',
                'messages.created_at',
            ]);

        $notifications = $messages
            ->groupBy('sender_id')
            ->map(fn ($senderMessages) => [
                'type' => 'message',
                'sender_id' => (int) $senderMessages->first()->sender_id,
                'sender_name' => $senderMessages->first()->sender_name,
                'message' => $senderMessages->first()->body,
                'created_at' => $senderMessages->first()->created_at,
                'unread_count' => $senderMessages->count(),
            ])
            ->values();

        $acceptedRequests = collect();
        if ($currentUser->role === 'teacher') {
            $acceptedRequests = DB::table('teacher_post_request_notifications as notifications')
                ->join('teacher_post_requests as requests', 'requests.id', '=', 'notifications.teacher_post_request_id')
                ->join('users as students', 'students.id', '=', 'requests.student_id')
                ->where('requests.teacher_id', $currentUser->id)
                ->where('requests.status', 'accepted')
                ->where('notifications.teacher_is_read', false)
                ->orderByDesc('requests.updated_at')
                ->get([
                    'notifications.id as notification_id',
                    'requests.student_id as sender_id',
                    'students.name as sender_name',
                    'requests.updated_at as created_at',
                ])
                ->map(fn ($notification) => [
                    'type' => 'accepted_request',
                    'notification_id' => (int) $notification->notification_id,
                    'sender_id' => (int) $notification->sender_id,
                    'sender_name' => $notification->sender_name,
                    'message' => $notification->sender_name . ' accepted your tutoring request.',
                    'created_at' => $notification->created_at,
                    'unread_count' => 1,
                ]);
        }

        $notifications = $notifications
            ->concat($acceptedRequests)
            ->sortByDesc('created_at')
            ->values();

        return response()->json([
            'unread_count' => $messages->count() + $acceptedRequests->count(),
            'notifications' => $notifications,
        ]);
    }

    public function markAcceptedRequestRead(Request $request, int $notificationId): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->role === 'teacher', 403, 'Only teachers can read these notifications.');

        $updated = DB::table('teacher_post_request_notifications as notifications')
            ->join('teacher_post_requests as requests', 'requests.id', '=', 'notifications.teacher_post_request_id')
            ->where('notifications.id', $notificationId)
            ->where('requests.teacher_id', $user->id)
            ->where('requests.status', 'accepted')
            ->update(['notifications.teacher_is_read' => true]);

        abort_unless($updated > 0, 404, 'Notification not found.');

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function store(Request $request, int $userId): JsonResponse
    {
        $currentUser = $request->user();
        $otherUser = User::findOrFail($userId);

        $this->authorizeConversation($currentUser, $otherUser);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);
        $body = trim($validated['body']);

        if ($body === '') {
            return response()->json(['message' => 'Message cannot be empty.'], 422);
        }

        $message = ChatMessage::create([
            'sender_id' => $currentUser->id,
            'receiver_id' => $otherUser->id,
            'body' => $body,
        ]);

        return response()->json(['message' => $message], 201);
    }

    private function authorizeConversation(User $currentUser, User $otherUser): void
    {
        abort_unless(
            in_array($currentUser->role, ['student', 'teacher'], true)
                && $otherUser->role !== $currentUser->role
                && in_array($otherUser->role, ['student', 'teacher'], true),
            403,
            'Chat is available only between students and teachers.'
        );

        $studentId = $currentUser->role === 'student'
            ? $currentUser->id
            : $otherUser->id;
        $teacherId = $currentUser->role === 'teacher'
            ? $currentUser->id
            : $otherUser->id;

        $acceptedPostRequest = DB::table('teacher_post_requests')
            ->where('student_id', $studentId)
            ->where('teacher_id', $teacherId)
            ->where('status', 'accepted')
            ->exists();

        $acceptedTutoringRequest = DB::table('tutoring_requests')
            ->where('student_id', $studentId)
            ->where('teacher_id', $teacherId)
            ->where('status', 'accepted')
            ->exists();

        $acceptedTuitionRequest = DB::table('tuition_requests as requests')
            ->join('teacher_profiles', 'teacher_profiles.id', '=', 'requests.teacher_profile_id')
            ->where('requests.student_id', $studentId)
            ->where('teacher_profiles.user_id', $teacherId)
            ->where('requests.status', 'accepted')
            ->exists();

        abort_unless(
            $acceptedPostRequest || $acceptedTutoringRequest || $acceptedTuitionRequest,
            403,
            'You can only chat with users connected through an accepted request.'
        );
    }
}
