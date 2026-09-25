<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_audits', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('location_id')
                ->nullable();

            $table->unsignedBigInteger('user_id')
                ->nullable();

            $table->string('action');

            $table->decimal('old_latitude', 10, 7)
                ->nullable();

            $table->decimal('old_longitude', 10, 7)
                ->nullable();

            $table->decimal('new_latitude', 10, 7)
                ->nullable();

            $table->decimal('new_longitude', 10, 7)
                ->nullable();

            $table->string('old_address')
                ->nullable();

            $table->string('new_address')
                ->nullable();

            $table->timestamp('created_at')
                ->useCurrent();
        });

        // INSERT trigger
        DB::unprepared("
            CREATE TRIGGER location_after_insert
            AFTER INSERT ON locations
            FOR EACH ROW
            INSERT INTO location_audits (
                location_id,
                user_id,
                action,
                new_latitude,
                new_longitude,
                new_address,
                created_at
            )
            VALUES (
                NEW.id,
                NEW.user_id,
                'INSERT',
                NEW.latitude,
                NEW.longitude,
                NEW.address,
                NOW()
            )
        ");

        // UPDATE trigger
        DB::unprepared("
            CREATE TRIGGER location_after_update
            AFTER UPDATE ON locations
            FOR EACH ROW
            INSERT INTO location_audits (
                location_id,
                user_id,
                action,
                old_latitude,
                old_longitude,
                new_latitude,
                new_longitude,
                old_address,
                new_address,
                created_at
            )
            VALUES (
                NEW.id,
                NEW.user_id,
                'UPDATE',
                OLD.latitude,
                OLD.longitude,
                NEW.latitude,
                NEW.longitude,
                OLD.address,
                NEW.address,
                NOW()
            )
        ");

        // DELETE trigger
        DB::unprepared("
            CREATE TRIGGER location_after_delete
            AFTER DELETE ON locations
            FOR EACH ROW
            INSERT INTO location_audits (
                location_id,
                user_id,
                action,
                old_latitude,
                old_longitude,
                old_address,
                created_at
            )
            VALUES (
                OLD.id,
                OLD.user_id,
                'DELETE',
                OLD.latitude,
                OLD.longitude,
                OLD.address,
                NOW()
            )
        ");
    }

    public function down(): void
    {
        DB::unprepared(
            'DROP TRIGGER IF EXISTS location_after_insert'
        );

        DB::unprepared(
            'DROP TRIGGER IF EXISTS location_after_update'
        );

        DB::unprepared(
            'DROP TRIGGER IF EXISTS location_after_delete'
        );

        Schema::dropIfExists('location_audits');
    }
};