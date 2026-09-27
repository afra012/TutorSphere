<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AcceptedChatUserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $connections = match ($user->role) {
            'student' => $this->studentConnections((int) $user->id),
            'teacher' => $this->teacherConnections((int) $user->id),
            default => collect(),
        };

        $users = $connections
            ->sortByDesc('accepted_at')
            ->unique('id')
            ->values()
            ->map(fn ($connection) => [
                'id' => (int) $connection->id,
                'name' => $connection->name,
                'role' => $connection->role,
                'profile_image' => $connection->profile_image,
            ]);

        return response()->json(['users' => $users]);
    }

    private function studentConnections(int $studentId): Collection
    {
        $connections = DB::table('teacher_post_requests as requests')
            ->join('users as counterpart', 'counterpart.id', '=', 'requests.teacher_id')
            ->leftJoin('teacher_profiles as profile', 'profile.user_id', '=', 'counterpart.id')
            ->where('requests.student_id', $studentId)
            ->where('requests.status', 'accepted')
            ->select('counterpart.id', 'counterpart.name', 'counterpart.role', 'profile.profile_image')
            ->selectRaw('requests.updated_at as accepted_at')
            ->get();

        $connections = $connections->merge(DB::table('tutoring_requests as requests')
            ->join('users as counterpart', 'counterpart.id', '=', 'requests.teacher_id')
            ->leftJoin('teacher_profiles as profile', 'profile.user_id', '=', 'counterpart.id')
            ->where('requests.student_id', $studentId)
            ->where('requests.status', 'accepted')
            ->select('counterpart.id', 'counterpart.name', 'counterpart.role', 'profile.profile_image')
            ->selectRaw('requests.updated_at as accepted_at')
            ->get());

        // Older student-to-teacher request flow stores a teacher profile id.
        return $connections->merge(DB::table('tuition_requests as requests')
            ->join('teacher_profiles as teacher_profile', 'teacher_profile.id', '=', 'requests.teacher_profile_id')
            ->join('users as counterpart', 'counterpart.id', '=', 'teacher_profile.user_id')
            ->leftJoin('teacher_profiles as profile', 'profile.user_id', '=', 'counterpart.id')
            ->where('requests.student_id', $studentId)
            ->where('requests.status', 'accepted')
            ->select('counterpart.id', 'counterpart.name', 'counterpart.role', 'profile.profile_image')
            ->selectRaw('requests.updated_at as accepted_at')
            ->get());
    }

    private function teacherConnections(int $teacherId): Collection
    {
        $connections = DB::table('teacher_post_requests as requests')
            ->join('users as counterpart', 'counterpart.id', '=', 'requests.student_id')
            ->leftJoin('student_profiles as profile', 'profile.user_id', '=', 'counterpart.id')
            ->where('requests.teacher_id', $teacherId)
            ->where('requests.status', 'accepted')
            ->select('counterpart.id', 'counterpart.name', 'counterpart.role', 'profile.profile_image')
            ->selectRaw('requests.updated_at as accepted_at')
            ->get();

        $connections = $connections->merge(DB::table('tutoring_requests as requests')
            ->join('users as counterpart', 'counterpart.id', '=', 'requests.student_id')
            ->leftJoin('student_profiles as profile', 'profile.user_id', '=', 'counterpart.id')
            ->where('requests.teacher_id', $teacherId)
            ->where('requests.status', 'accepted')
            ->select('counterpart.id', 'counterpart.name', 'counterpart.role', 'profile.profile_image')
            ->selectRaw('requests.updated_at as accepted_at')
            ->get());

        // Older requests reference a teacher profile instead of the user id.
        return $connections->merge(DB::table('tuition_requests as requests')
            ->join('teacher_profiles as teacher_profile', 'teacher_profile.id', '=', 'requests.teacher_profile_id')
            ->join('users as counterpart', 'counterpart.id', '=', 'requests.student_id')
            ->leftJoin('student_profiles as profile', 'profile.user_id', '=', 'counterpart.id')
            ->where('teacher_profile.user_id', $teacherId)
            ->where('requests.status', 'accepted')
            ->select('counterpart.id', 'counterpart.name', 'counterpart.role', 'profile.profile_image')
            ->selectRaw('requests.updated_at as accepted_at')
            ->get());
    }
}
