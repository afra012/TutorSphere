<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionPurchase extends Model
{
    protected $fillable = [
        'user_id',
        'purchaser_name',
        'purchaser_email',
        'purchaser_role',
        'plan_name',
        'amount',
        'currency',
        'status',
        'payment_method',
        'transaction_id',
        'starts_at',
        'ends_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
