<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FindTutorController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\TeacherProfileController;
use App\Http\Controllers\TutorPostController;
use App\Http\Controllers\TutoringRequestController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TuitionRequestController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\TeacherPostRequestController;
use App\Http\Controllers\TeacherPostRequestNotificationController;


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
    | Subjects
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
    | Tutor Requests
    |--------------------------------------------------------------------------
    */

    // Student sends a tutor request
    Route::post('/tuition-requests', [
        TuitionRequestController::class,
        'store'
    ]);

    // Student sees own request history/status
    Route::get('/my-tuition-requests', [
        TuitionRequestController::class,
        'studentRequests'
    ]);

    // Teacher sees own tutor requests
    Route::get('/teacher/tuition-requests', [
        TuitionRequestController::class,
        'teacherRequests'
    ]);

    // Teacher accepts or rejects a tutor request
    Route::patch('/teacher/tuition-requests/{id}/status', [
        TuitionRequestController::class,
        'updateStatus'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Tutoring Requests (student -> tutor)
    |--------------------------------------------------------------------------
    */

    Route::get('/tutoring-requests', [
        TutoringRequestController::class,
        'index'
    ]);

    Route::post('/tutoring-requests', [
        TutoringRequestController::class,
        'store'
    ]);

    Route::patch('/tutoring-requests/{id}/status', [
        TutoringRequestController::class,
        'updateStatus'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Teacher Requests for Student Posts
    |--------------------------------------------------------------------------
    */

    // Teacher sends request from a student post
    Route::post('/teacher/post-requests', [
        TeacherPostRequestController::class,
        'store'
    ]);

    // Teacher sees requests already sent to student posts
    Route::get('/teacher/post-requests', [
        TeacherPostRequestController::class,
        'teacherRequests'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Student Notifications for Teacher Post Requests
    |--------------------------------------------------------------------------
    */

    // Student sees teacher request notifications
    Route::get('/student/teacher-post-request-notifications', [
        TeacherPostRequestNotificationController::class,
        'index'
    ]);

    // Student marks one notification as read
    Route::patch('/student/teacher-post-request-notifications/{id}/read', [
        TeacherPostRequestNotificationController::class,
        'markAsRead'
    ]);

    // Student accepts or rejects teacher request
    Route::patch('/student/teacher-post-request-notifications/{id}/respond', [
        TeacherPostRequestNotificationController::class,
        'respond'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Tutor Request Notifications
    |--------------------------------------------------------------------------
    */

    // Teacher sees all notifications
    Route::get('/teacher/tuition-request-notifications', [
        TuitionRequestController::class,
        'notifications'
    ]);

    // Teacher marks notifications as read
    Route::patch('/teacher/tuition-request-notifications/read', [
        TuitionRequestController::class,
        'markNotificationsRead'
    ]);

    // Teacher deletes one notification
    Route::delete('/teacher/tuition-request-notifications/{id}', [
        TuitionRequestController::class,
        'deleteNotification'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Reviews
    |--------------------------------------------------------------------------
    */

    // Student sees own reviews
    Route::get('/my-reviews', [
        ReviewController::class,
        'myReviews'
    ]);

    // Submit review
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


    /*
    |--------------------------------------------------------------------------
    | Locations
    |--------------------------------------------------------------------------
    */

    Route::get('/locations', [
        LocationController::class,
        'index'
    ]);

    Route::get('/locations/me', [
        LocationController::class,
        'me'
    ]);

    Route::post('/locations', [
        LocationController::class,
        'store'
    ]);

    Route::put('/locations/{id}', [
        LocationController::class,
        'update'
    ]);

    Route::delete('/locations/{id}', [
        LocationController::class,
        'destroy'
    ]);
});


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
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
    | Admin Test
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/test', function (Request $request) {
        return response()->json([
            'message' => 'Admin access successful.',
            'user' => $request->user(),
        ]);
    });
});