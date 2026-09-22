<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TuitionRequest extends Model
{
    protected $fillable = [
        'student_id',
        'teacher_profile_id',
        'status',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];
}
