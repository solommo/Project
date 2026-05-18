<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAnswer extends Model
{
    /** @use HasFactory<\Database\Factories\AnswerFactory> */
    use HasFactory;

    protected $table = 'answers';

    protected $fillable = [
        'quiz_id',
        'question_id',
        'student_id',
        'answer_text',
        'correctness',
        'subtopic_id',
        
    ];

    public function quiz()
    {
        //    quiz::distinct()->
        return $this->belongsTo(Quiz::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    public function subtopic()
    {
        return $this->belongsTo(Subtopic::class);
    }
}
