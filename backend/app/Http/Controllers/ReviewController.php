<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Public Reviews
    |--------------------------------------------------------------------------
    |
    | Only approved reviews are visible publicly.
    |
    */

    public function index()
    {
        $reviews = Review::with([
            'student:id,name,email,role',
            'teacher:id,name,email,role',
        ])
            ->where('status', 'approved')
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    /*
    |--------------------------------------------------------------------------
    | Student Own Reviews
    |--------------------------------------------------------------------------
    |
    | Student can see pending, approved and rejected reviews.
    |
    */

    public function myReviews(Request $request)
    {
        $student = $request->user();

        if (!$student) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (strtolower($student->role) !== 'student') {
            return response()->json([
                'message' => 'Only students can access their reviews.'
            ], 403);
        }

        $reviews = Review::with([
            'student:id,name,email,role',
            'teacher:id,name,email,role',
        ])
            ->where('student_id', $student->id)
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Review
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $request->validate([
            'teacher_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'rating' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],
            'review_text' => [
                'required',
                'string',
                'min:3',
            ],
        ]);

        $student = $request->user();

        if (!$student) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (strtolower($student->role) !== 'student') {
            return response()->json([
                'message' => 'Only students can submit reviews.'
            ], 403);
        }

        $teacher = User::find($request->teacher_id);

        if (!$teacher) {
            return response()->json([
                'message' => 'Selected user does not exist.'
            ], 422);
        }

        if (strtolower($teacher->role) !== 'teacher') {
            return response()->json([
                'message' => 'You can only review a teacher.'
            ], 422);
        }

        $review = Review::create([
            'student_id' => $student->id,
            'teacher_id' => $teacher->id,
            'rating' => $request->rating,
            'review_text' => $request->review_text,
            'status' => 'pending',
        ]);

        $review->load([
            'student:id,name,email,role',
            'teacher:id,name,email,role',
        ]);

        return response()->json([
            'message' => 'Review submitted and is waiting for admin approval.',
            'review' => $review,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Own Review
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $request->validate([
            'rating' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],
            'review_text' => [
                'required',
                'string',
                'min:3',
            ],
        ]);

        $review = Review::findOrFail($id);

        if (
            (int) $review->student_id !==
            (int) $request->user()->id
        ) {
            return response()->json([
                'message' => 'You can only update your own review.'
            ], 403);
        }

        $review->update([
            'rating' => $request->rating,
            'review_text' => $request->review_text,

            // Edited review must be approved again.
            'status' => 'pending',
        ]);

        $review->load([
            'student:id,name,email,role',
            'teacher:id,name,email,role',
        ]);

        return response()->json([
            'message' => 'Review updated and sent for approval.',
            'review' => $review,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Own Review
    |--------------------------------------------------------------------------
    */

    public function destroy(Request $request, $id)
    {
        $review = Review::findOrFail($id);

        if (
            (int) $review->student_id !==
            (int) $request->user()->id
        ) {
            return response()->json([
                'message' => 'You can only delete your own review.'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully.'
        ]);
    }
}