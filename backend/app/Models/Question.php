<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    /** @use HasFactory<\Database\Factories\QuestionFactory> */
    use HasFactory;

    protected $fillable = [
        'question',
        'quiz_id',
        'subtopic_id',
        'option_1',
        'option_2',
        'option_3',
        'option_4',
        'correct_answer',
        'image_url',
        'difficulty',
        'cognitive_skill',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function subtopic()
    {
        return $this->belongsTo(Subtopic::class);
    }

    public function options()
    {
        return $this->hasMany(Option::class);
    }

    public function answers()
    {
        return $this->hasMany(StudentAnswer::class, 'question_id');
    }
}
