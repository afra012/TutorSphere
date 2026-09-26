<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_post_request_notifications', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('teacher_post_request_id');
            $table->unsignedBigInteger('student_id');

            $table->string('message');

            $table->boolean('is_read')->default(false);

            $table->timestamps();

            $table->unique(
                'teacher_post_request_id',
                'tprn_request_unique'
            );

            $table->foreign(
                'teacher_post_request_id',
                'tprn_request_fk'
            )
                ->references('id')
                ->on('teacher_post_requests')
                ->cascadeOnDelete();

            $table->foreign(
                'student_id',
                'tprn_student_fk'
            )
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_post_request_notifications');
    }
};