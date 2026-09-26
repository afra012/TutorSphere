<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Get started with essential features.',
                'price' => 299,
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'features' => [
                    'Up to 5 tutor requests per month',
                    'Standard listing visibility',
                    'Email support',
                ],
            ],
            [
                'name' => 'Standard',
                'slug' => 'standard',
                'description' => 'For students and teachers who use TutorSphere regularly.',
                'price' => 799,
                'billing_cycle' => 'monthly',
                'duration_days' => 30,
                'features' => [
                    'Unlimited tutor requests',
                    'Priority listing visibility',
                    'Priority email support',
                ],
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'description' => 'Full access, billed yearly at a discount.',
                'price' => 7999,
                'billing_cycle' => 'yearly',
                'duration_days' => 365,
                'features' => [
                    'Unlimited tutor requests',
                    'Top listing placement',
                    'Priority support with faster response time',
                    '2 months free compared to monthly Standard',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
