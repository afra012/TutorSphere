<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Get All Reviews
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $reviews = Review::with([
            'student:id,name,email,role',
            'teacher:id,name,email,role',
        ])
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


        /*
        |--------------------------------------------------------------------------
        | Logged-in User
        |--------------------------------------------------------------------------
        */

        $student = $request->user();


        /*
        |--------------------------------------------------------------------------
        | Only Student can submit review
        |--------------------------------------------------------------------------
        */

        if ($student->role !== 'student') {
            return response()->json([
                'message' =>
                    'Only students can submit reviews.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Check Selected User
        |--------------------------------------------------------------------------
        */

        $teacher = User::find(
            $request->teacher_id
        );

        if (!$teacher) {
            return response()->json([
                'message' =>
                    'Selected user does not exist.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Create Review
        |--------------------------------------------------------------------------
        */

        $review = Review::create([
            'student_id' => $student->id,

            'teacher_id' => $teacher->id,

            'rating' => $request->rating,

            'review_text' =>
                $request->review_text,
        ]);


        /*
        |--------------------------------------------------------------------------
        | Load Relationships
        |--------------------------------------------------------------------------
        */

        $review->load([
            'student:id,name,email,role',
            'teacher:id,name,email,role',
        ]);


        return response()->json([
            'message' =>
                'Review created successfully',

            'review' => $review,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | Update Review
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        $id
    ) {
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


        /*
        |--------------------------------------------------------------------------
        | Only Owner Can Update
        |--------------------------------------------------------------------------
        */

        if (
            $review->student_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' =>
                    'You can only update your own review.',
            ], 403);
        }


        $review->update([
            'rating' => $request->rating,

            'review_text' =>
                $request->review_text,
        ]);


        $review->load([
            'student:id,name,email,role',
            'teacher:id,name,email,role',
        ]);


        return response()->json([
            'message' =>
                'Review updated successfully',

            'review' => $review,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Delete Review
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        $id
    ) {
        $review = Review::findOrFail($id);


        /*
        |--------------------------------------------------------------------------
        | Only Owner Can Delete
        |--------------------------------------------------------------------------
        */

        if (
            $review->student_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' =>
                    'You can only delete your own review.',
            ], 403);
        }


        $review->delete();


        return response()->json([
            'message' =>
                'Review deleted successfully',
        ]);
    }
}