<?php

namespace App\Http\Controllers;

use App\Models\TutorPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TutorPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->user()->role === 'student') {
            return response()->json([
                'posts' => $request->user()->tutorPosts()->with('subject')->latest()->get(),
            ]);
        }

        abort_unless($request->user()->role === 'teacher', 403, 'Only teachers can view student tutor posts.');

        // INNER JOIN requires a valid student and subject. LEFT JOIN keeps posts
        // from students who have not yet completed their optional profile.
        $posts = DB::table('student_tutor_posts as p')
            ->join('users as u', 'u.id', '=', 'p.student_id')
            ->join('subjects as s', 's.id', '=', 'p.subject_id')
            ->leftJoin('student_profiles as sp', 'sp.user_id', '=', 'p.student_id')
            ->where('p.status', 'active')
            ->orderByDesc('p.created_at')
            ->select([
                'p.*', 'u.name as student_name', 'u.email as student_email',
                's.subject_name', 'sp.phone as profile_phone', 'sp.address as student_address',
            ])
            ->get();

        return response()->json(['posts' => $posts]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureStudent($request);

        $post = $request->user()->tutorPosts()->create($this->validatedData($request));

        return response()->json([
            'message' => 'Post submitted successfully!',
            'post' => $post->load('subject'),
        ], 201);
    }

    public function show(Request $request, TutorPost $tutorPost): JsonResponse
    {
        $this->ensureCanView($request, $tutorPost);
        return response()->json(['post' => $tutorPost->load(['student.studentProfile', 'subject'])]);
    }

    public function update(Request $request, TutorPost $tutorPost): JsonResponse
    {
        $this->ensureOwner($request, $tutorPost);

        $tutorPost->update($this->validatedData($request));

        return response()->json([
            'message' => 'Post updated successfully!',
            'post' => $tutorPost->fresh()->load('subject'),
        ]);
    }

    public function destroy(Request $request, TutorPost $tutorPost): JsonResponse
    {
        $this->ensureOwner($request, $tutorPost);
        $tutorPost->delete();

        return response()->json(['message' => 'Post deleted successfully!']);
    }

    private function ensureStudent(Request $request): void
    {
        abort_unless($request->user()->role === 'student', 403, 'Only students can create or manage tutor posts.');
    }

    private function ensureOwner(Request $request, TutorPost $tutorPost): void
    {
        $this->ensureStudent($request);
        abort_unless($tutorPost->student_id === $request->user()->id, 403, 'You can only manage your own posts.');
    }

    private function ensureCanView(Request $request, TutorPost $tutorPost): void
    {
        if ($request->user()->role === 'teacher') {
            return;
        }

        $this->ensureOwner($request, $tutorPost);
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'location' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:30'],
            'tutoring_mode' => ['required', Rule::in(['online', 'in-person', 'both'])],
            'salary_amount' => ['required', 'numeric', 'min:0'],
            'salary_period' => ['required', Rule::in(['weekly', 'monthly'])],
            'description' => ['required', 'string', 'max:5000'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);
    }
}
