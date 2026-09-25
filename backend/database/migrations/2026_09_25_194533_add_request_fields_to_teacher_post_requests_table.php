<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teacher_post_requests', function (Blueprint $table) {
            $table->foreignId('tutor_post_id')
                ->after('id')
                ->constrained('student_tutor_posts')
                ->cascadeOnDelete();

            $table->foreignId('teacher_id')
                ->after('tutor_post_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('student_id')
                ->after('teacher_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('status', [
                'pending',
                'accepted',
                'rejected'
            ])
                ->default('pending')
                ->after('student_id');
        });
    }

    public function down(): void
    {
        Schema::table('teacher_post_requests', function (Blueprint $table) {
            $table->dropForeign(['tutor_post_id']);
            $table->dropForeign(['teacher_id']);
            $table->dropForeign(['student_id']);

            $table->dropColumn([
                'tutor_post_id',
                'teacher_id',
                'student_id',
                'status'
            ]);
        });
    }
};