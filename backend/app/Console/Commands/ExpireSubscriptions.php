<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';
    protected $description = 'Mark active subscriptions past their end_date as expired';

    public function handle(): void
    {
        DB::statement('CALL expire_subscriptions()');
        $this->info('Expired subscriptions updated.');
    }
}
