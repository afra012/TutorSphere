<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\TeacherProfileController;
use App\Http\Controllers\TutorPostController;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/register', [
    AuthController::class,
    'register'
]);

Route::post('/login', [
    AuthController::class,
    'login'
]);

/*
|--------------------------------------------------------------------------
| Public Reviews
|--------------------------------------------------------------------------
*/

Route::get('/reviews', [
    ReviewController::class,
    'index'
]);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);

    // =========================================================
    // CURRENT USER
    // =========================================================

    Route::get('/user', function (Request $request) {

        return response()->json(
            $request->user()
        );

    });

    // =========================================================
    // USERS
    // =========================================================

    Route::get('/users', function () {

        return response()->json([
            'users' => \App\Models\User::select(
                'id',
                'name',
                'role'
            )->get()
        ]);

    });

    // =========================================================
    // STUDENT PROFILE
    // =========================================================

    Route::get('/student/profile', [
        StudentProfileController::class,
        'show'
    ]);

    Route::put('/student/profile', [
        StudentProfileController::class,
        'update'
    ]);

    Route::post('/student/profile', [
        StudentProfileController::class,
        'update'
    ]);

    // =========================================================
    // STUDENT SUBJECTS
    // =========================================================

    Route::get('/subjects', [
        StudentProfileController::class,
        'subjects'
    ]);

    // =========================================================
    // INNER JOIN
    // =========================================================

    Route::get('/student/profile/inner-join', [
        StudentProfileController::class,
        'innerJoin'
    ]);

    // =========================================================
    // RIGHT JOIN
    // =========================================================

    Route::get('/student/profile/right-join', [
        StudentProfileController::class,
        'rightJoin'
    ]);

    // =========================================================
    // TEACHER PROFILE
    // =========================================================

    Route::get('/teacher-profile', [
        TeacherProfileController::class,
        'show'
    ]);

    Route::put('/teacher-profile', [
        TeacherProfileController::class,
        'update'
    ]);

    // =========================================================
    // TEACHER SUBJECTS
    // =========================================================

    Route::get('/teacher-profile/subjects', [
        TeacherProfileController::class,
        'subjects'
    ]);

    // =========================================================
    // TEACHER LANGUAGES
    // =========================================================

    Route::get('/teacher-profile/languages', [
        TeacherProfileController::class,
        'languages'
    ]);

    // =========================================================
    // TEACHER PROFILE IMAGE
    // =========================================================

    Route::post('/teacher-profile/image', [
        TeacherProfileController::class,
        'uploadImage'
    ]);

    // =========================================================
    // TUTOR POSTS (students create/manage; teachers view active posts)
    // =========================================================

    Route::get('/tutor-posts', [TutorPostController::class, 'index']);
    Route::post('/tutor-posts', [TutorPostController::class, 'store']);
    Route::get('/tutor-posts/{tutorPost}', [TutorPostController::class, 'show']);
    Route::put('/tutor-posts/{tutorPost}', [TutorPostController::class, 'update']);
    Route::delete('/tutor-posts/{tutorPost}', [TutorPostController::class, 'destroy']);

    // =========================================================
    // REVIEWS CRUD
    // =========================================================

    Route::post('/reviews', [
        ReviewController::class,
        'store'
    ]);

    Route::put('/reviews/{id}', [
        ReviewController::class,
        'update'
    ]);

    Route::delete('/reviews/{id}', [
        ReviewController::class,
        'destroy'
    ]);
});
