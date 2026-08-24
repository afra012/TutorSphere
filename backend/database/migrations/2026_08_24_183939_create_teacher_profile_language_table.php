<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_profile_language', function (Blueprint $table) {
            $table->id();

            $table->foreignId('teacher_profile_id')
                ->constrained('teacher_profiles')
                ->cascadeOnDelete();

            $table->foreignId('language_id')
                ->constrained('languages')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique([
                'teacher_profile_id',
                'language_id'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_profile_language');
    }
};