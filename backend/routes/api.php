<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FindTutorController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\TeacherProfileController;
use App\Http\Controllers\TutorPostController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\AdminController;

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

Route::get('/auth/google', [
    GoogleAuthController::class,
    'redirect'
]);

Route::get('/auth/google/callback', [
    GoogleAuthController::class,
    'callback'
]);

/*
|--------------------------------------------------------------------------
| Public Reviews
|--------------------------------------------------------------------------
|
| Only approved reviews should be returned by ReviewController@index().
|
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

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Current User
    |--------------------------------------------------------------------------
    */

    Route::get('/user', function (Request $request) {
        return response()->json(
            $request->user()
        );
    });

    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

    Route::get('/users', function () {
        return response()->json([
            'users' => \App\Models\User::select(
                'id',
                'name',
                'role'
            )->get()
        ]);
    });

    /*
    |--------------------------------------------------------------------------
    | Student Profile
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Student Subjects
    |--------------------------------------------------------------------------
    */

    Route::get('/subjects', [
        TeacherProfileController::class,
        'subjects'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Teacher Profile
    |--------------------------------------------------------------------------
    */

    Route::get('/teacher-profile', [
        TeacherProfileController::class,
        'show'
    ]);

    Route::put('/teacher-profile', [
        TeacherProfileController::class,
        'update'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Teacher Subjects
    |--------------------------------------------------------------------------
    */

    Route::get('/teacher-profile/subjects', [
        TeacherProfileController::class,
        'subjects'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Teacher Languages
    |--------------------------------------------------------------------------
    */

    Route::get('/teacher-profile/languages', [
        TeacherProfileController::class,
        'languages'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Teacher Profile Image
    |--------------------------------------------------------------------------
    */

    Route::post('/teacher-profile/image', [
        TeacherProfileController::class,
        'uploadImage'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Tutor Posts
    |--------------------------------------------------------------------------
    */

    Route::get('/tutor-posts', [
        TutorPostController::class,
        'index'
    ]);

    Route::post('/tutor-posts', [
        TutorPostController::class,
        'store'
    ]);

    Route::get('/tutor-posts/{tutorPost}', [
        TutorPostController::class,
        'show'
    ]);

    Route::patch('/tutor-posts/{tutorPost}/accept', [
        TutorPostController::class,
        'accept'
    ]);

    Route::put('/tutor-posts/{tutorPost}', [
        TutorPostController::class,
        'update'
    ]);

    Route::delete('/tutor-posts/{tutorPost}', [
        TutorPostController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Find Tutor
    |--------------------------------------------------------------------------
    */

    Route::get('/find-tutor', [
        FindTutorController::class,
        'index'
    ]);

    Route::get('/find-tutor/{id}', [
        FindTutorController::class,
        'show'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Reviews
    |--------------------------------------------------------------------------
    */

    // Student's own reviews
    // Includes pending, approved and rejected reviews.
    Route::get('/my-reviews', [
        ReviewController::class,
        'myReviews'
    ]);

    // Submit new review
    Route::post('/reviews', [
        ReviewController::class,
        'store'
    ]);

    // Edit own review
    Route::put('/reviews/{id}', [
        ReviewController::class,
        'update'
    ]);

    // Delete own review
    Route::delete('/reviews/{id}', [
        ReviewController::class,
        'destroy'
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Only authenticated users with admin role can access these routes.
|
*/

Route::middleware([
    'auth:sanctum',
    'admin'
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Admin Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/dashboard', [
        AdminController::class,
        'dashboard'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Admin Reviews
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/reviews', [
        AdminController::class,
        'reviews'
    ]);

    Route::put('/admin/reviews/{id}/approve', [
        AdminController::class,
        'approveReview'
    ]);

    Route::put('/admin/reviews/{id}/reject', [
        AdminController::class,
        'rejectReview'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Admin Management
    |--------------------------------------------------------------------------
    */

    Route::post('/admin/add-admin', [
        AdminController::class,
        'addAdmin'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Admin Middleware Test
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/test', function (Request $request) {
        return response()->json([
            'message' => 'Admin access successful.',
            'user' => $request->user(),
        ]);
    });
});