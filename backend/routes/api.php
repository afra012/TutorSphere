<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReviewController;

use App\Http\Controllers\StudentProfileController;

use App\Models\User;


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\TeacherProfileController;


// =========================================================
// Authentication
// =========================================================


Route::post('/register', [
    AuthController::class,
    'register'
]);

Route::post('/login', [
    AuthController::class,
    'login'
]);


Route::post('/logout', [
    AuthController::class,
    'logout'
])->middleware('auth:sanctum');


/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
|
| Both Student and Teacher will be returned.
|
*/

Route::get('/users', function () {
    return User::select(
        'id',
        'name',
        'role'
    )->get();
})->middleware('auth:sanctum');


/*
|--------------------------------------------------------------------------
| Student Profile
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Get logged-in student's profile
    |--------------------------------------------------------------------------
    */

    Route::get('/student/profile', [
        StudentProfileController::class,
        'show'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Save / Update Student Profile
    |--------------------------------------------------------------------------
    */

    // Normal JSON update
    Route::put('/student/profile', [
        StudentProfileController::class,
        'update'
    ]);

    // FormData + Profile Image upload
    Route::post('/student/profile', [
        StudentProfileController::class,
        'update'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Get available subjects
    |--------------------------------------------------------------------------
    */

    Route::get('/subjects', [
        StudentProfileController::class,
        'subjects'
    ]);


    /*
    |--------------------------------------------------------------------------
    | INNER JOIN
    |--------------------------------------------------------------------------
    */

    Route::get('/student/profile/inner-join', [
        StudentProfileController::class,
        'innerJoin'
    ]);


    /*
    |--------------------------------------------------------------------------
    | RIGHT JOIN
    |--------------------------------------------------------------------------
    */

    Route::get('/student/profile/right-join', [
        StudentProfileController::class,
        'rightJoin'
    ]);
});


/*
|--------------------------------------------------------------------------
| Reviews
|--------------------------------------------------------------------------
*/

Route::get('/reviews', [
    ReviewController::class,
    'index'
]);

Route::post('/reviews', [
    ReviewController::class,
    'store'
])->middleware('auth:sanctum');

Route::put('/reviews/{id}', [
    ReviewController::class,
    'update'
])->middleware('auth:sanctum');

Route::delete('/reviews/{id}', [
    ReviewController::class,
    'destroy'
])->middleware('auth:sanctum');


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
