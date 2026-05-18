<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentAnswerRequest;
use App\Http\Requests\UpdateStudentAnswerRequest;
use App\Http\Resources\QuizAttemptCollection;
use App\Http\Resources\StudentAnswerCollection;
use App\Models\LessonAttempt;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\StudentAnswer;
use Tymon\JWTAuth\Facades\JWTAuth;

use Illuminate\Support\Facades\Http;

class StudentAnswerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // public function index()
    // {
    //     $student = JWTAuth::user()->student;
    //     $cacheKey = 'quiz_attempts_student_'.$student->id;

    //     // Paginated version
    //     // $quizAttempts = cache()->remember($cacheKey, 1440, function () use ($student) {
    //     //     return $student->quizzesAttempt()->paginate(10);
    //     // });

    //     // Non-paginated version
    //     $quizAttempts = cache()->remember($cacheKey.'_all', 60, function () use ($student) {
    //         return $student->quizzesAttempt;
    //     });

    //     return ['quizzesAttempt' => new QuizAttemptCollection($quizAttempts)];
    // }

    /**
     * Store a newly created resource in storage.
     */


    public function answer(StoreStudentAnswerRequest $request, Quiz $quiz)
    {
        // dd($quiz);
        $student = JWTAuth::user()->student;
        LessonAttempt::where('student_id', $student->id)
            ->where('lesson_id', $quiz->video->lesson_id)
            ->update(['quiz_attempted' => true, 'quiz_id' => $quiz->id, 'video_id' => $quiz->video_id, 'teacher_id' => $quiz->teacher_id]);
        // dd($student);
        $answers = $request->validated();
        // if ($student->quizzesAttempt()->where('quiz_id', $quiz->id)->first()) {
        //     return response()->json(['message' => 'Attempt already submitted'], 400);
        // }
        $score = 0;
        foreach ($answers['answers'] as $answer) {
            $question = $quiz->questions()->findOrFail($answer['question_id']);
            $isCorrect = ($question->correct_answer === $answer['answer_text']);
            if ($isCorrect) {
                $score += 1;
            }
            $answer = StudentAnswer::create([
                'quiz_id' => $quiz->id,
                'question_id' => $answer['question_id'],
                'subtopic_id' => $question->subtopic_id,
                'student_id' => $student->id,
                'answer_text' => $answer['answer_text'],
                'correctness' => $isCorrect,
            ]);
        }
        
        QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'student_id' => $student->id,
            'score' => $score,
            'total_marks' => $quiz->total_marks,
        ]);
       $answers_correctness = $quiz->questions()->get(['id', 'subtopic_id', 'question', 'correct_answer'])->map(function ($question) use ($student) {
            $answer = StudentAnswer::where('student_id', $student->id)
                ->where('question_id', $question->id)
                ->first();
            return [
                'question_id' => $question->id,
                'subtopic_id' => $question->subtopic_id,
                'question' => $question->question,
                'correct_answer' => $question->correct_answer,
                'student_answer' => $answer ? $answer->answer_text : null,
                'is_correct' => $answer ? $answer->correctness : null,
            ];
        });
        return response()->json(['message' => 'Answer saved', 'answers' => $answers_correctness, 'score' => $score, 'total_marks' => $quiz->total_marks, 'ai_evaluation' => (new StudentController())->subtopicEvaluation($quiz)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(StudentAnswer $answer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStudentAnswerRequest $request, StudentAnswer $answer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StudentAnswer $answer)
    {
        //
    }
}
