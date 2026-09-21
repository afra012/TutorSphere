<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request)
    {
        $email = strtolower(
            trim($request->query('email', ''))
        );

        if (!$email) {
            return redirect(
                'http://localhost:5173/login?google_error=email_required'
            );
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return redirect(
                'http://localhost:5173/login?google_error=invalid_email'
            );
        }

        $admin = User::whereRaw(
            'LOWER(email) = ?',
            [$email]
        )
            ->where('role', 'admin')
            ->first();

        if (!$admin) {
            return redirect(
                'http://localhost:5173/login?google_error=unauthorized'
            );
        }

        return Socialite::driver('google')
            ->stateless()
            ->with([
                'login_hint' => $email,
                'prompt' => 'select_account',
            ])
            ->redirect();
    }

    public function callback(Request $request)
    {
        try {

            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $googleEmail = strtolower(
                trim($googleUser->getEmail())
            );

            /*
            |--------------------------------------------------------------------------
            | Check Google account is a registered admin
            |--------------------------------------------------------------------------
            */

            $user = User::whereRaw(
                'LOWER(email) = ?',
                [$googleEmail]
            )
                ->where('role', 'admin')
                ->first();

            if (!$user) {
                return redirect(
                    'http://localhost:5173/login?google_error=unauthorized'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Create token
            |--------------------------------------------------------------------------
            */

            $token = $user
                ->createToken('auth_token')
                ->plainTextToken;

            /*
            |--------------------------------------------------------------------------
            | Send both token and actual Google email
            |--------------------------------------------------------------------------
            */

            return redirect(
                'http://localhost:5173/?google_token=' .
                urlencode($token) .
                '&google_email=' .
                urlencode($googleEmail)
            );

        } catch (\Exception $e) {

            \Log::error(
                'Google Login Error: ' .
                $e->getMessage()
            );

            return redirect(
                'http://localhost:5173/login?google_error=login_failed'
            );
        }
    }
}