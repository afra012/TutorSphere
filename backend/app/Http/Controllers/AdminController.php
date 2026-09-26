<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\SubscriptionPurchase;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    private function checkAdmin(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (strtolower($user->role) !== 'admin') {
            return response()->json([
                'message' => 'Admin access required.'
            ], 403);
        }

        return null;
    }

    public function dashboard(Request $request)
    {
        $error = $this->checkAdmin($request);

        if ($error) {
            return $error;
        }

        return response()->json([
            'students' => User::where('role', 'student')->count(),
            'teachers' => User::where('role', 'teacher')->count(),
            'pending_reviews' => Review::where(
                'status',
                'pending'
            )->count(),
            'admins' => User::where('role', 'admin')->count(),
        ]);
    }

    public function reviews(Request $request)
    {
        $error = $this->checkAdmin($request);

        if ($error) {
            return $error;
        }

        $reviews = Review::with([
            'student:id,name,email',
            'teacher:id,name,email',
        ])
            ->latest()
            ->get();

        return response()->json([
            'reviews' => $reviews
        ]);
    }

    public function approveReview(Request $request, $id)
    {
        $error = $this->checkAdmin($request);

        if ($error) {
            return $error;
        }

        $review = Review::findOrFail($id);

        $review->status = 'approved';
        $review->save();

        return response()->json([
            'message' => 'Review approved successfully.',
            'review' => $review
        ]);
    }

    public function rejectReview(Request $request, $id)
    {
        $error = $this->checkAdmin($request);

        if ($error) {
            return $error;
        }

        $review = Review::findOrFail($id);

        $review->status = 'rejected';
        $review->save();

        return response()->json([
            'message' => 'Review rejected successfully.',
            'review' => $review
        ]);
    }

    public function subscriptionHistory(Request $request)
    {
        $error = $this->checkAdmin($request);

        if ($error) {
            return $error;
        }

        $purchases = SubscriptionPurchase::query()
            ->with('user:id,name,email,role')
            ->latest()
            ->get();

        return response()->json([
            'purchases' => $purchases,
            'summary' => [
                'total' => $purchases->count(),
                'paid' => $purchases->where('status', 'paid')->count(),
                'revenue' => $purchases
                    ->where('status', 'paid')
                    ->sum(fn ($purchase) => (float) $purchase->amount),
                'simulated' => $purchases->where('status', 'simulated')->count(),
                'simulated_value' => $purchases
                    ->where('status', 'simulated')
                    ->sum(fn ($purchase) => (float) $purchase->amount),
            ],
        ]);
    }
    public function addAdmin(Request $request)
    {
        $error = $this->checkAdmin($request);

        if ($error) {
            return $error;
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'unique:users,email',
            ],
        ]);

        $admin = User::create([
            'name' => $request->name,
            'email' => strtolower($request->email),
            'role' => 'admin',
            'password' => Hash::make(
                Str::random(32)
            ),
        ]);

        return response()->json([
            'message' => 'Admin added successfully.',
            'admin' => $admin
        ], 201);
    }
}