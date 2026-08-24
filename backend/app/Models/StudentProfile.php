<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProfile extends Model
{
    protected $fillable = [
        'user_id',
        'profile_image',
        'phone',
        'address',
        'education_level',
        'institution',
        'class_grade',
        'preferred_time',
        'about_me',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}