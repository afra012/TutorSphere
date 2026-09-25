<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherPostRequestNotification extends Model
{
    protected $fillable = [
        'teacher_post_request_id',
        'student_id',
        'message',
        'is_read',
    ];
}