<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuizRequest;
use App\Http\Requests\UpdateQuizRequest;
use App\Http\Resources\QuizResource;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Video;
use Illuminate\Support\Facades\Gate;
use Tymon\JWTAuth\Facades\JWTAuth;

class QuizController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $teacher = JWTAuth::user()->teacher;
        $page = request()->get('page', 1);
        $cacheKey = 'quizzes_teacher_' . $teacher->id . '_page_' . $page;

        $quizzes = cache()->remember($cacheKey, 60, function () use ($teacher) {
            return $teacher->quizzes()->paginate(10);
        });

        return ['quizzes' => $quizzes];
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorequizRequest $request)
    {

        $questions = $request->validated();
        $video = Video::findOrFail($questions['video_id']);
        Gate::authorize('create', [Quiz::class, $video]);
        $quiz = Quiz::create([
            'lesson_id' => $video->lesson_id,
            'teacher_id' => JWTAuth::user()->teacher->id,
            'video_id' => $questions['video_id'],
            'title' => $questions['title'] ?? 'Untitled Quiz',
        ]);

        foreach ($questions['questions'] as $qData) {
            $question = $quiz->questions()->create([
                'question' => $qData['question'],
                'subtopic_id' => $qData['subtopic_id'],
                'option_1' => $qData['option'][0] ?? null,
                'option_2' => $qData['option'][1] ?? null,
                'option_3' => $qData['option'][2] ?? null,
                'option_4' => $qData['option'][3] ?? null,
                'correct_answer' => $qData['correct_answer'],
                'difficulty' => $qData['difficulty'] ?? null,
                'cognitive_skill' => $qData['cognitive_skill'] ?? null,
            ]);
        }
        $quiz->update([
            'total_marks' => $quiz->questions()->count(),
        ]);
        return ['questions_of_quiz' => $quiz->questions()->paginate(10)];
    }

    /**
     * Display the specified resource.
     */
    public function show(Quiz $quiz)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuizRequest $request, Quiz $quiz)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Video $video, Quiz $quiz)
    {
        Gate::authorize('delete', [Quiz::class, $video]);
        $quiz->delete();

        return response()->json([
            'message' => 'the quiz deleted successfully',
        ]);
    }

    /**
     * Get all quizzes.
     */
    public function getAllQuizzes()
    {
        $quizzes = Quiz::paginate(10);

        return response()->json([
            'quizzes' => QuizResource::collection($quizzes)->response()->getData(true)
        ]);
    }

    /**
     * Get a specific question for a quiz.
     */
    public function getQuestion(Quiz $quiz, Question $question)
    {
        if ($question->quiz_id !== $quiz->id) {
            return response()->json(['error' => 'Question does not belong to the specified quiz'], 404);
        }

        return response()->json(['question' => new QuizResource($question)]);
    }
}
