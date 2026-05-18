<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Models\AiPrediction;
use App\Models\Quiz;
use App\Models\StudentSubtopicEvaluation;
use App\Models\StudentSubtopicState;
use App\Models\Subtopic;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Services\AIEvaluationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $student = JWTAuth::user()->student;
        $lesson_attempts = $student->lessonAttempts()->where('quiz_attempted', true)->orderBy('created_at', 'desc')->get();

        return response()->json([
            'message' => 'Student dashboard data retrieved successfully',
            'student' => new StudentResource($student),
            'lesson_attempts_completed_count' => $lesson_attempts->count(),
            'lesson_attempts' => $student->lessonAttempts ? $student->lessonAttempts->map(function ($attempt) use ($student) {
                $score = $attempt->quiz_id ? $student->quizzesAttempt()->where('quiz_id', $attempt->quiz_id)->value('score') : null;
                $total_marks = $attempt->quiz_id ? $attempt->quiz->total_marks : null;
                return [
                    'teacher_id' => $attempt->teacher_id,
                    'lesson_id' => $attempt->lesson_id,
                    'video_id' => $attempt->video_id,
                    'teacher_name' => $attempt->teacher->user->name ?? 'Unknown Teacher',
                    'lesson_title' => $attempt->lesson->title,
                    'video_title' => $attempt->video->title,
                    'quiz_title' => $attempt->quiz ? $attempt->quiz->title : null,
                    'profile_picture' => $attempt->teacher->user->profile_picture,
                    'score' => $score,
                    'total_marks' => $attempt->quiz_id ? $attempt->quiz->total_marks : null,

                    'attempted_at' => $attempt->created_at->format('Y-m-d H:i:s'),
                ];
            }) : null,
            'subtopic_evaluations' => $student->subtopicEvaluations()->with('subtopic')->get() ?? null


            // You can add more data here as needed, such as recent quiz attempts, recommended lessons, etc.
        ]);
        // For now, just return a placeholder response

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStudentRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStudentRequest $request, Student $student)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        //
    }

    public function aiTest(Request $request)
    {
        $payload = $request->json()->all();

        if (empty($payload)) {
            $payload = $request->all();
        }

        if (empty($payload)) {
            $payload = $this->buildAiTestPayload($this->resolveAiTestUserId());
        }

        try {
            if (!is_array($payload)) {
                return response()->json([
                    'error' => 'Prediction payload must be an object or array.',
                ], 400);
            }

            $batchPayload = $this->normalizeAiBatchPayload($payload);

            if (empty($batchPayload)) {
                return response()->json([
                    'error' => 'No valid prediction items were found.',
                ], 400);
            }

            $response = Http::acceptJson()->timeout(10)->post($this->aiPredictorUrl(), $batchPayload);

            if ($response->successful()) {
                $responseData = $response->json();

                return response()->json([
                    'message' => 'Connected to AI successfully!',
                    'payload' => $batchPayload,
                    'ai_response' => $responseData,
                ], $response->status());
            }

            return response()->json([
                'error' => 'AI service returned an error.',
                'details' => $response->json() ?? $response->body(),
            ], $response->status());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Could not connect to AI: ' . $e->getMessage()], 500);
        }
    }

    private function normalizeAiBatchPayload(array $payload): array
    {
        if (array_is_list($payload) && !empty($payload) && isset($payload[0]['student_history'])) {
            return $payload;
        }

        if (array_is_list($payload)) {
            return $this->groupSkillHistoryRecords($payload);
        }

        foreach (['items', 'predictions', 'skills', 'tests', 'history_records'] as $key) {
            if (!empty($payload[$key]) && is_array($payload[$key])) {
                $skillsDifficulty = $payload['skills_difficulty'] ?? $payload['skills_meta'] ?? [];

                return $this->groupSkillHistoryRecords($payload[$key], $skillsDifficulty);
            }
        }

        return [
            [
                'skill_id' => (string) ($payload['skill_id'] ?? ''),
                'skill_name' => $payload['skill_name'] ?? 'Unknown Skill',
                'skill_difficulty_avg' => (float) ($payload['skill_difficulty_avg'] ?? 0.5),
                'student_history' => array_map(
                    static fn($value) => (int) $value,
                    $payload['student_history'] ?? []
                ),
            ],
        ];
    }

    private function groupSkillHistoryRecords(array $records, array $skillsDifficulty = []): array
    {
        $normalizedDifficulty = $this->normalizeSkillsDifficultyMap($skillsDifficulty);
        $grouped = [];

        foreach ($records as $record) {
            if (!is_array($record)) {
                continue;
            }

            $skillId = (string) ($record['skill_id'] ?? '');

            if ($skillId === '') {
                continue;
            }

            if (!isset($grouped[$skillId])) {
                $grouped[$skillId] = [
                    'skill_id' => $skillId,
                    'skill_name' => $record['skill_name'] ?? 'Unknown Skill',
                    'skill_difficulty_avg' => $normalizedDifficulty[$skillId] ?? (float) ($record['skill_difficulty_avg'] ?? 0.5),
                    'student_history' => [],
                ];
            }

            $grouped[$skillId]['student_history'][] = (int) ($record['is_correct'] ?? $record['correctness'] ?? 0);
        }

        return array_values($grouped);
    }

    private function buildAiTestPayload($userId = null): array
    {
        return [
            'items' => [
                ['order_id' => 101, 'skill_id' => 10, 'skill_name' => 'Algebra Basics', 'user_id' => $userId, 'is_correct' => 1],
                ['order_id' => 102, 'skill_id' => 10, 'skill_name' => 'Algebra Basics', 'user_id' => $userId, 'is_correct' => 0],
                ['order_id' => 103, 'skill_id' => 10, 'skill_name' => 'Algebra Basics', 'user_id' => $userId, 'is_correct' => 1],
                ['order_id' => 104, 'skill_id' => 12, 'skill_name' => 'Fractions', 'user_id' => $userId, 'is_correct' => 0],
                ['order_id' => 105, 'skill_id' => 12, 'skill_name' => 'Fractions', 'user_id' => $userId, 'is_correct' => 1],
                ['order_id' => 106, 'skill_id' => 15, 'skill_name' => 'Word Problems', 'user_id' => $userId, 'is_correct' => 1],
                ['order_id' => 107, 'skill_id' => 15, 'skill_name' => 'Word Problems', 'user_id' => $userId, 'is_correct' => 1],
                ['order_id' => 108, 'skill_id' => 15, 'skill_name' => 'Word Problems', 'user_id' => $userId, 'is_correct' => 0],
            ],
            'skills_difficulty' => [
                10 => 0.35,
                12 => 0.60,
                15 => 0.25,
            ],
        ];
    }

    private function normalizeSkillsMeta(array $skillsDifficulty): array
    {
        $normalized = [];

        foreach ($skillsDifficulty as $skillId => $difficulty) {
            $normalized[(string) $skillId] = [
                'skill_difficulty_avg' => (float) $difficulty,
            ];
        }

        return $normalized;
    }

    private function normalizeSkillsDifficultyMap(array $skillsDifficulty): array
    {
        $normalized = [];

        foreach ($skillsDifficulty as $skillId => $difficulty) {
            if (is_array($difficulty)) {
                $difficulty = $difficulty['skill_difficulty_avg'] ?? $difficulty['difficulty'] ?? 0.5;
            }

            $normalized[(string) $skillId] = (float) $difficulty;
        }

        return $normalized;
    }

    private function resolveAiTestUserId()
    {
        try {
            return JWTAuth::user()?->id;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function aiPredictorUrl(): string
    {
        return env('AI_PREDICTOR_URL', 'http://127.0.0.1:5000/predict');
    }


    public function subtopicEvaluation(Quiz $quiz)
    {
        $student = JWTAuth::user()->student;
        $userId = $student->id;

        $quiz_subtopics = $quiz->questions()->pluck('subtopic_id')->unique()->toArray();
        $subtopics = Subtopic::whereIn('id', $quiz_subtopics)->get(['id', 'title', 'subtopic_difficulty'])->keyBy('id');

        // جلب التاريخ بالكامل مرتب تصاعدياً حسب الـ id (من الأقدم للأحدث) ليقوم الـ AI بحساب الـ Snapshot صح
        $student_answers = $student->answers()
            ->whereIn('subtopic_id', $quiz_subtopics)
            ->orderBy('id', 'asc')
            ->get(['id as order_id', 'subtopic_id as skill_id', 'correctness as is_correct']);

        $subtopic_difficulty = $subtopics->pluck('subtopic_difficulty', 'id')->toArray();

        $items = $student_answers->values()->map(function ($answer) use ($subtopics, $userId) {
            $subtopic = $subtopics->get($answer->skill_id);

            return [
                'order_id'   => (int) $answer->order_id,
                'skill_id'   => (string) $answer->skill_id,
                'skill_name' => $subtopic?->title ?? 'Unknown',
                'user_id'    => (int) $userId,
                'is_correct' => (int) $answer->is_correct,
            ];
        })->toArray();

        $payload = $this->groupSkillHistoryRecords($items, $subtopic_difficulty);

        if (empty($payload)) {
            return [
                'count' => 0,
                'data' => []
            ];
        }

        try {
            $response = Http::acceptJson()
                ->timeout(12)
                ->post($this->aiPredictorUrl(), $payload);

            // return((int)($response->json()[0]['skill_id']));

            if ($response->successful()) {
                // Log full AI response for debugging (check storage/logs/laravel.log)
                Log::debug('AI response for subtopicEvaluation', $response->json());

                foreach ($response->json() as $item) {
                    // Allow multiple key names for status and log each item
                    $status = $item['status'] ?? $item['evaluation_status'] ?? null;
                    Log::debug('AI prediction item', $item);

                    StudentSubtopicEvaluation::updateOrCreate(
                        [
                            'student_id' => $userId,
                            'subtopic_id' => $item['skill_id'],
                        ],
                        [
                            'subtopic_evaluation' =>  round($item['mastery_score']) ?? null,
                            'evaluation_status' => $status,
                            'question_count' =>  $item['total_attempts'] ?? null,
                            'correct_count' =>   $item['total_correct'] ?? null,
                        ]
                    );
                }

                // ✅ إصلاح الـ Bug الثاني: إرجاع المصفوفة مباشرة بدون response()->json()
                return $student->subtopicEvaluations()->whereIn('subtopic_id', $quiz_subtopics)->get()->map(function ($evaluation) use ($subtopics) {
                    return [
                        'subtopic_id' => $evaluation->subtopic_id,
                        'subtopic_title' => $subtopics->get($evaluation->subtopic_id)->title ?? 'Unknown',
                        'subtopic_evaluation' => $evaluation->subtopic_evaluation,
                        'evaluation_status' => $evaluation->evaluation_status,
                        'question_count' => $evaluation->question_count,
                        'correct_count' => $evaluation->correct_count,
                    ];
                });
            }

            return [
                'error' => 'AI returned an error',
                'details' => $response->json() ?? $response->body()
            ];
        } catch (\Exception $e) {
            return [
                'error' => 'AI could not be reached',
                'message' => $e->getMessage()
            ];
        }
    }
}
