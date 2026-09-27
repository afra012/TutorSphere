<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teacher_post_request_notifications', function (Blueprint $table) {
            // Existing accepted requests should not become new alerts on migration.
            $table->boolean('teacher_is_read')->default(true)->after('is_read');
        });
    }

    public function down(): void
    {
        Schema::table('teacher_post_request_notifications', function (Blueprint $table) {
            $table->dropColumn('teacher_is_read');
        });
    }
};
