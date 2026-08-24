<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TeacherProfileController;


// =========================================================
// Authentication
// =========================================================

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);


// =========================================================
// Authenticated User
// =========================================================

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return response()->json(
            $request->user()
        );
    });

    Route::get('/users', function (Request $request) {
        return response()->json([
            'users' => \App\Models\User::all()
        ]);
    });


    // =====================================================
    // Teacher Profile
    // =====================================================

    Route::get(
        '/teacher-profile',
        [TeacherProfileController::class, 'show']
    );

    Route::put(
        '/teacher-profile',
        [TeacherProfileController::class, 'update']
    );

    Route::get(
        '/teacher-profile/subjects',
        [TeacherProfileController::class, 'subjects']
    );

    Route::get(
        '/teacher-profile/languages',
        [TeacherProfileController::class, 'languages']
    );

    Route::post(
        '/teacher-profile/image',
        [TeacherProfileController::class, 'uploadImage']
    );
});


// =========================================================
// Reviews
// =========================================================

Route::get(
    '/reviews',
    [ReviewController::class, 'index']
);

Route::middleware('auth:sanctum')->group(function () {

    Route::post(
        '/reviews',
        [ReviewController::class, 'store']
    );

    Route::put(
        '/reviews/{id}',
        [ReviewController::class, 'update']
    );

    Route::delete(
        '/reviews/{id}',
        [ReviewController::class, 'destroy']
    );
});