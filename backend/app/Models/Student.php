<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    /** @use HasFactory<\Database\Factories\StudentFactory> */
    use HasFactory;


    protected $fillable = [
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(StudentAnswer::class, 'student_id');
    }

    public function quizzesAttempt()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function lessonAttempts()
    {
        return $this->hasMany(LessonAttempt::class);
    }

    public function weaknessProfiles()
    {
        return $this->hasMany(StudentSubtopicProgress::class);
    }

    public function recommendations()
    {
        return $this->hasMany(Recommendation::class);
    }

    public function subtopicEvaluations()
    {
        return $this->hasMany(StudentSubtopicEvaluation::class);
    }
}
