<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\Language;

class TeacherDashboardSeeder extends Seeder
{
    public function run(): void
    {
        // ---------------------------------------------------------
        // Subjects
        // ---------------------------------------------------------

        $subjects = [
            'Accounting',
            'Bangla',
            'Biology',
            'Chemistry',
            'Computer Science',
            'Economics',
            'English',
            'ICT',
            'Mathematics',
            'Physics',
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate([
                'subject_name' => $subject,
            ]);
        }

        // ---------------------------------------------------------
        // Languages
        // ---------------------------------------------------------

        $languages = [
            'Arabic',
            'Bangla',
            'English',
            'French',
            'Hindi',
            'Spanish',
        ];

        foreach ($languages as $language) {
            Language::firstOrCreate([
                'language_name' => $language,
            ]);
        }
    }
}