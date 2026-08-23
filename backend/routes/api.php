<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReviewController;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');


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