<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    /** @use HasFactory<\Database\Factories\TeacherFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject_id',

    ];

    protected static function booted()
    {
        static::saved(function ($teacher) {
            if ($teacher->wasChanged('subject_id')) {
                cache()->forget('teachers_subject_'.$teacher->getOriginal('subject_id').'_all');
            }
            cache()->forget('teachers_subject_'.$teacher->subject_id.'_all');
        });
        static::deleted(fn ($teacher) => cache()->forget('teachers_subject_'.$teacher->subject_id.'_all'));
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function lessons()
    {
        return $this->hasManyThrough(
            Lesson::class,
            Video::class,
            'teacher_id', // Foreign key on videos table
            'id',         // Foreign key on lessons table (we use primary key here)
            'id',         // Local key on teachers table
            'lesson_id'   // Local key on videos table
        );
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function videos()
    {
        return $this->hasMany(Video::class);
    }
    public function lessonAttempts()
    {
        return $this->hasMany(LessonAttempt::class);
    }
}
