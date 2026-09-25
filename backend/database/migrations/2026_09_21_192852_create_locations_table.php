<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('address');

            $table->timestamps();

            // One location per user
            $table->unique('user_id');
        });

        DB::statement("
            CREATE OR REPLACE VIEW user_locations_view AS
            SELECT
                locations.id AS location_id,
                users.id AS user_id,
                users.name,
                users.email,
                users.role,
                locations.address,
                locations.latitude,
                locations.longitude,
                locations.created_at,
                locations.updated_at
            FROM locations
            INNER JOIN users
                ON users.id = locations.user_id
            WHERE users.role IN ('teacher', 'student')
        ");
    }

    public function down(): void
    {
        DB::statement(
            'DROP VIEW IF EXISTS user_locations_view'
        );

        Schema::dropIfExists('locations');
    }
};