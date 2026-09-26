<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Copy of users.role at the time of subscribing (student / teacher).
            // Denormalized on purpose: lets the table itself show who a
            // subscription belongs to without a join to users.
            $table->string('subscriber_role', 20)
                ->nullable()
                ->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('subscriber_role');
        });
    }
};
