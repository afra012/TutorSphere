<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_tutor_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->restrictOnDelete();
            $table->string('location');
            $table->string('contact_number', 30);
            $table->enum('tutoring_mode', ['online', 'in-person', 'both']);
            $table->decimal('salary_amount', 10, 2);
            $table->enum('salary_period', ['weekly', 'monthly']);
            $table->text('description');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->index(['status', 'created_at']);
            $table->index(['student_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_tutor_posts');
    }
};
