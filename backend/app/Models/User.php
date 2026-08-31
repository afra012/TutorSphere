```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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

    /*
    |--------------------------------------------------------------------------
    | Student Profile Relationship
    |--------------------------------------------------------------------------
    */

    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Student Subjects Relationship
    |--------------------------------------------------------------------------
    */

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(
            Subject::class,
            'student_subjects',
            'student_id',
            'subject_id'
        )->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | Teacher Profile Relationship
    |--------------------------------------------------------------------------
    */

    public function teacherProfile(): HasOne
    {
        return $this->hasOne(
            TeacherProfile::class,
            'user_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Tutor Posts Relationship
    |--------------------------------------------------------------------------
    */

    public function tutorPosts(): HasMany
    {
        return $this->hasMany(
            TutorPost::class,
            'student_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Teacher Subjects Relationship
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Teacher Languages Relationship
    |--------------------------------------------------------------------------
    */

    public function teachingLanguages(): BelongsToMany
    {
        return $this->belongsToMany(
            Language::class,
            'teacher_languages',
            'teacher_id',
            'language_id'
        )->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | Reviews Received (as Teacher) Relationship
    |--------------------------------------------------------------------------
    */

    public function reviews(): HasMany
    {
        return $this->hasMany(
            Review::class,
            'teacher_id'
        );
    }
}

