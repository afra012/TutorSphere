<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tuition_requests', function (Blueprint $table) {
            $table->id();

            // Student who sends the request
            $table->foreignId('student_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Teacher who receives the request
            $table->foreignId('teacher_profile_id')
                ->constrained('teacher_profiles')
                ->cascadeOnDelete();

            // Request status
            $table->enum('status', [
                'pending',
                'accepted',
                'rejected'
            ])->default('pending');

            // For notification bell
            $table->boolean('is_read')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tuition_requests');
    }
};