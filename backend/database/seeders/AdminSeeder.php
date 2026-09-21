<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'name' => 'Fahmida Afrin Nadia',
                'email' => 'nadiafaruqi.2005@gmail.com',
            ],
            [
                'name' => 'Afifa Faija',
                'email' => 'faija0022@gmail.com',
            ],
            [
                'name' => 'Ahona Zabin',
                'email' => 'ahonatasrif@gmail.com',
            ],
            [
                'name' => 'Afra Anan',
                'email' => 'afrarami11@gmail.com',
            ],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(
                ['email' => $admin['email']],
                [
                    'name' => $admin['name'],
                    'role' => 'admin',
                ]
            );
        }
    }
}