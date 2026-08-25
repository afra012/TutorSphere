<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;


    protected $fillable = [
        'subject_name',
    ];


    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'student_subjects',
            'subject_id',
            'student_id'
        )->withTimestamps();
    }
}

    public function teacherProfiles()
    {
        return $this->belongsToMany(
            TeacherProfile::class,
            'teacher_profile_subject'
        );
    }
}

