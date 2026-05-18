<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonAttempt extends Model
{
    /** @use HasFactory<\Database\Factories\LessonAttemptFactory> */
    use HasFactory;

    protected $fillable = [
        'student_id',
        'lesson_id',
        'video_id',
        'quiz_id',
        'quiz_attempted',
        'teacher_id',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
    public function video()
    {
        return $this->belongsTo(Video::class);
    }
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
    public function quizAttempt()
    {
        return $this->hasOne(QuizAttempt::class);
    }
    public function studentAnswers()
    {
        return $this->hasMany(StudentAnswer::class, 'lesson_attempt_id');
    }
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
