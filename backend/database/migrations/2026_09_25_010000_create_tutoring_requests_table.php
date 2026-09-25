<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutoring_requests', function (Blueprint $table) {
            $table->id();

            // Both ids point to users.id (role = student / teacher),
            // same convention as the reviews table.
            $table->foreignId('student_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('teacher_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // pending | accepted | rejected | cancelled
            $table->string('status', 20)->default('pending');

            $table->text('message')->nullable();

            $table->timestamp('responded_at')->nullable();

            $table->timestamps();

            $table->index(['student_id', 'teacher_id', 'status']);
            $table->index(['teacher_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutoring_requests');
    }
};
