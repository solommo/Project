<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subtopic extends Model
{
    /** @use HasFactory<\Database\Factories\SubtopicFactory> */
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'subtopic_difficulty',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
    public function studentEvaluations()
    {
        return $this->hasMany(StudentSubtopicEvaluation::class);
    }
    protected static function booted()
    {
        static::creating(function ($subtopic) {
            if (is_null($subtopic->subtopic_difficulty)) {
                $subtopic->subtopic_difficulty = mt_rand() / mt_getrandmax();
            }
        });
    }
}
