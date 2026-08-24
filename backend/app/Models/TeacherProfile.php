<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'location',
        'date_of_birth',
        'gender',
        'qualification',
        'teaching_experience',
        'hourly_rate',
        'institution',
        'certification',
        'bio',
        'availability',
        'tutoring_mode',
        'time_zone',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'hourly_rate' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(
            Subject::class,
            'teacher_profile_subject'
        );
    }

    public function languages()
    {
        return $this->belongsToMany(
            Language::class,
            'teacher_profile_language'
        );
    }
}