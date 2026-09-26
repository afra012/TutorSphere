<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPurchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | 1. LIST AVAILABLE PLANS
    |--------------------------------------------------------------------------
    */

    public function plans()
    {
        $plans = SubscriptionPlan::active()
            ->orderBy('price')
            ->get();

        return response()->json([
            'plans' => $plans
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 2. CURRENT USER'S SUBSCRIPTION
    |--------------------------------------------------------------------------
    */

    public function current(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $subscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->latest('start_date')
            ->first();

        return response()->json([
            'subscription' => $subscription
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3. SUBSCRIBE TO A PLAN
    |--------------------------------------------------------------------------
    |
    | Wrapped in a transaction because two related writes must succeed or
    | fail together: closing out any existing active subscription, and
    | creating the new one. Without the transaction, a failure between the
    | two steps could leave the user with no active plan, or with two.
    |
    */

    public function subscribe(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $request->validate([
            'plan_id' => 'required|integer|exists:subscription_plans,id'
        ]);

        $plan = SubscriptionPlan::active()->find($request->plan_id);

        if (!$plan) {
            return response()->json([
                'message' => 'This plan is not currently available.'
            ], 422);
        }

        DB::beginTransaction();

        try {

            /*
            ----------------------------------------------------------
            CLOSE OUT ANY EXISTING ACTIVE SUBSCRIPTION
            ----------------------------------------------------------
            */

            // lockForUpdate() so two concurrent subscribe requests from the
            // same user can't both pass this check and create duplicates.
            $existing = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->lockForUpdate()
                ->first();

            if ($existing) {
                $existing->update([
                    'status' => 'replaced',
                    'cancelled_at' => null,
                ]);
            }

            /*
            ----------------------------------------------------------
            CREATE NEW SUBSCRIPTION
            ----------------------------------------------------------
            */

            $subscription = Subscription::create([
                'user_id' => $user->id,
                'subscriber_role' => $user->role,
                'subscription_plan_id' => $plan->id,
                'status' => 'active',
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days),
            ]);

            // This project currently has a demo checkout, not a verified payment gateway.
            // Keep the purchase visible to admins without recording simulated revenue.
            SubscriptionPurchase::create([
                'user_id' => $user->id,
                'purchaser_name' => $user->name,
                'purchaser_email' => $user->email,
                'purchaser_role' => $user->role,
                'plan_name' => $plan->name,
                'amount' => $plan->price,
                'currency' => 'BDT',
                'status' => 'simulated',
                'payment_method' => 'Demo card (no charge)',
                'starts_at' => $subscription->start_date,
                'ends_at' => $subscription->end_date,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Subscribed successfully.',
                'subscription' => $subscription->load('plan')
            ], 201);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Subscription failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 4. CANCEL CURRENT SUBSCRIPTION
    |--------------------------------------------------------------------------
    */

    public function cancel(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->latest('start_date')
            ->first();

        if (!$subscription) {
            return response()->json([
                'message' => 'You have no active subscription to cancel.'
            ], 422);
        }

        DB::beginTransaction();

        try {

            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Subscription cancelled.',
                'subscription' => $subscription->fresh('plan')
            ]);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Cancellation failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

