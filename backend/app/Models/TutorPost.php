<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorPost extends Model
{
    use HasFactory;

    protected $table = 'student_tutor_posts';

    protected $fillable = [
        'student_id',
        'subject_id',
        'location',
        'contact_number',
        'tutoring_mode',
        'salary_amount',
        'salary_period',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'salary_amount' => 'decimal:2',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
