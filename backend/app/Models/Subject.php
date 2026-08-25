<?php

namespace App\Models;

use App\Models\TeacherDashboard\TeacherProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_name',
    ];

    /*
    |--------------------------------------------------------------------------
    | Student Relationship
    |--------------------------------------------------------------------------
    */

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'student_subjects',
            'subject_id',
            'student_id'
        )->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | Teacher Profile Relationship
    |--------------------------------------------------------------------------
    */

    public function teacherProfiles(): BelongsToMany
    {
        return $this->belongsToMany(
            TeacherProfile::class,
            'teacher_profile_subject',
            'subject_id',
            'teacher_profile_id'
        )->withTimestamps();
    }
}