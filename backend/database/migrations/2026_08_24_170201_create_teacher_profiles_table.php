<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('phone', 30)->nullable();
            $table->string('location')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 20)->nullable();

            $table->string('qualification')->nullable();
            $table->string('teaching_experience')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();

            $table->string('institution')->nullable();
            $table->string('certification')->nullable();

            $table->text('bio')->nullable();

            $table->string('availability')->nullable();
            $table->string('tutoring_mode')->nullable();
            $table->string('time_zone')->nullable();

            $table->string('profile_image')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_profiles');
    }
};