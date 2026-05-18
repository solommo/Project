<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    /** @use HasFactory<\Database\Factories\QuizFactory> */
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'teacher_id',
        'video_id',
        'title',
        'time_limit',
        'total_marks'
    ];

    protected static function booted()
    {
        static::saved(function ($quiz) {
            if ($quiz->wasChanged('teacher_id')) {
                cache()->forget('quizzes_teacher_'.$quiz->getOriginal('teacher_id').'_all');
            }
            cache()->forget('quizzes_teacher_'.$quiz->teacher_id.'_all');
        });
        static::deleted(fn ($quiz) => cache()->forget('quizzes_teacher_'.$quiz->teacher_id.'_all'));
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function video()
    {
        return $this->belongsTo(Video::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function answers()
    {
        return $this->hasMany(StudentAnswer::class, 'quiz_id');
    }

    public function quizzesAttempt()
    {
        return $this->hasMany(QuizAttempt::class);
    }
    public function lessonAttempts()
    {
        return $this->hasMany(LessonAttempt::class);    }


}
