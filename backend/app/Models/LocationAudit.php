<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocationAudit extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'location_id',
        'user_id',
        'action',
        'old_latitude',
        'old_longitude',
        'new_latitude',
        'new_longitude',
        'old_address',
        'new_address',
        'created_at',
    ];
}