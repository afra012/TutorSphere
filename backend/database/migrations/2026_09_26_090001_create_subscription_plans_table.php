<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('price'); // BDT, whole taka
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'yearly']);
            $table->unsignedInteger('duration_days'); // used to compute end_date on subscribe
            $table->json('features')->nullable(); // e.g. ["Unlimited tutor requests", "Priority listing"]
            $table->boolean('is_active')->default(true); // hide plan from listing without deleting it
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
