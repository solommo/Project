<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentAnswerRequest;
use App\Http\Resources\QuizAttemptCollection;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\StudentAnswer;
use Tymon\JWTAuth\Facades\JWTAuth;

class QuizAttemptController extends Controller
{
    public function index()
    {
        $student = JWTAuth::user()->student;
        $page = request()->get('page', 1);
        $cacheKey = 'quiz_attempts_student_' . $student->id . '_page_' . $page;

        $quizAttempts = cache()->remember($cacheKey, 60, function () use ($student) {
            return $student->quizzesAttempt()->paginate(10);
        });

        return response()->json([
            'quizzesAttempt' => (new QuizAttemptCollection($quizAttempts))->response()->getData(true)
        ]);
    }
    // /**
    //  * Start a new quiz attempt.
    //  * POST /api/quizzes/{id}/attempt

    //     public function start(Quiz $quiz)
    //     {
    //         $student = JWTAuth::user()->student;

    //         // Check for existing uncompleted attempt (optional, based on project logic)
    //         $existingAttempt = QuizAttempt::where('student_id', $student->id)
    //             ->where('quiz_id', $quiz->id)
    //             ->whereNull('completed_at')
    //             ->first();

    //         if ($existingAttempt) {
    //             return response()->json([
    //                 'message' => 'Continuing previous attempt',
    //                 'attempt_id' => $existingAttempt->id,
    //             ]);
    //         }

    //         $attempt = QuizAttempt::create([
    //             'student_id' => $student->id,
    //             'quiz_id' => $quiz->id,
    //             'started_at' => now(),
    //         ]);

    //         return response()->json([
    //             'message' => 'Attempt started',
    //             'attempt_id' => $attempt->id,
    //         ], 201);
    //     }

    //     /**
    //      * Submit an answer during an attempt.
    //      * POST /api/attempts/{attemptId}/answer
    //      */
    //     public function answer(StoreStudentAnswerRequest $request, QuizAttempt $attempt)
    //     {

    //         if ($attempt->completed_at) {
    //             return response()->json(['message' => 'Attempt already submitted'], 400);
    //         }

    //         $question = $attempt->quiz->questions()->findOrFail($request->question_id);

    //         $isCorrect = ($question->correct_answer === $request->answer_text);

    //         $answer = StudentAnswer::updateOrCreate(
    //             [
    //                 'student_id' => $attempt->student_id,
    //                 'quiz_id' => $attempt->quiz_id,
    //                 'question_id' => $request->question_id,
    //             ],
    //             [
    //                 'answer_text' => $request->answer_text,
    //                 'correctness' => $isCorrect,
    //             ]
    //         );

    //         return response()->json(['message' => 'Answer saved']);
    //     }

    //     /**
    //      * Finalize the attempt and calculate score.
    //      * POST /api/attempts/{attemptId}/submit
    //      */
    //     public function submit(QuizAttempt $attempt)
    //     {
    //         if ($attempt->completed_at) {
    //             return response()->json(['message' => 'Already submitted'], 400);
    //         }

    //         $totalQuestions = $attempt->quiz->questions()->count();
    //         $correctAnswers = $attempt->answers()->where('correctness', true)->count();

    //         $score = ($totalQuestions > 0) ? round(($correctAnswers / $totalQuestions) * 100) : 0;

    //         $attempt->update([
    //             'score' => $score,
    //             'completed_at' => now(),
    //         ]);

    //         // PHASE 2 TODO: Trigger AI analysis job here
    //         // AnalyzeQuizJob::dispatch($attempt);

    //         return response()->json([
    //             'message' => 'Quest submitted successfully',
    //             'score' => $score,
    //             'correct' => $correctAnswers,
    //             'total' => $totalQuestions,
    //         ]);
    //     }

    //     /**
    //      * Get detailed results of an attempt.
    //      * GET /api/attempts/{attemptId}/results
    //      */
    //     public function results(QuizAttempt $attempt)
    //     {
    //         if (! $attempt->completed_at) {
    //             return response()->json(['message' => 'Attempt not yet submitted'], 400);
    //         }

    //         return response()->json([
    //             'quiz_title' => $attempt->quiz->title ?? 'Untitled Quiz',
    //             'score' => $attempt->score,
    //             'started_at' => $attempt->started_at,
    //             'completed_at' => $attempt->completed_at,
    //             'answers' => $attempt->answers()->with('question:id,question')->get(),
    //         ]);
    //     }
}
