<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\Language;

class TeacherDashboardSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Subjects
        |--------------------------------------------------------------------------
        */

        $subjects = [
            'Mathematics',
            'Physics',
            'Chemistry',
            'English',
            'Biology',
            'ICT',
            'Computer Science',
            'Bangla',
            'Accounting',
            'Economics',
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate([
                'subject_name' => $subject,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Languages
        |--------------------------------------------------------------------------
        */

        $languages = [
            'English',
            'Bangla',
            'Hindi',
            'Arabic',
            'Spanish',
            'French',
        ];

        foreach ($languages as $language) {
            Language::firstOrCreate([
                'language_name' => $language,
            ]);
        }
    }
}
