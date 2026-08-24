<?php

namespace App\Models;

use App\Models\TeacherDashboard\Language;
use App\Models\TeacherDashboard\Subject;
use App\Models\TeacherDashboard\TeacherProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function teacherProfile()
    {
        return $this->hasOne(TeacherProfile::class, 'user_id');
    }

    public function teachingSubjects()
    {
        return $this->hasManyThrough(
            Subject::class,
            TeacherProfile::class,
            'user_id',
            'id',
            'id',
            'id'
        );
    }

    public function teachingLanguages()
    {
        return $this->belongsToMany(
            Language::class,
            'teacher_languages',
            'teacher_id',
            'language_id'
        )->withTimestamps();
    }
}