<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    /** @use HasFactory<\Database\Factories\VideoFactory> */
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'lesson_id',
        'title',
        'url',
        'duration',
        'views',
        'thumbnail',
    ];

    protected static function booted()
    {
        static::saved(function ($video) {
            if ($video->wasChanged('teacher_id')) {
                cache()->forget('videos_teacher_'.$video->getOriginal('teacher_id').'_all');
            }
            cache()->forget('videos_teacher_'.$video->teacher_id.'_all');
        });
        static::deleted(fn ($video) => cache()->forget('videos_teacher_'.$video->teacher_id.'_all'));
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
    
    public function lessonAttempts()
    {
        return $this->hasMany(LessonAttempt::class);
    }
}
