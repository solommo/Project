<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    /** @use HasFactory<\Database\Factories\LessonFactory> */
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'title',

    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
    public function subject()
    {
        return $this->unit->subject;
    }

    public function subtopics()
    {
        return $this->hasMany(Subtopic::class);
    }

    public function videos()
    {
        return $this->hasMany(Video::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function attempts()
    {
        return $this->hasMany(LessonAttempt::class);
    }
}
