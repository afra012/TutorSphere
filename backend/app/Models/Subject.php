<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{
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
