<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentSubtopicEvaluation extends Model
{
    /** @use HasFactory<\Database\Factories\StudentSubtopicEvaluationFactory> */
    use HasFactory;
    protected $fillable = [
        'student_id',
        'subtopic_id',
        'subtopic_evaluation',
        'evaluation_status',
        'question_count',
        'correct_count',
    ];
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    public function subtopic()
    {
        return $this->belongsTo(Subtopic::class);
    }
    
}
