<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Tymon\JWTAuth\Facades\JWTAuth;

class VideoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // dd(JWTAuth::getToken());
        $user = null;
        try {
            if ($token = JWTAuth::getToken()) {
                $user = JWTAuth::toUser($token);
            }
        } catch (\Exception $e) {
            // Ignore token errors for unauthenticated routes
        }

        if ($user && $user->hasRole('student')) {
            // dd("hello");
            $student = $user->student;
            $quizzes = $this->quizzes;
            $quiz_attempted = [];
            foreach ($quizzes as $quiz) {
                $attempt = $student->quizzesAttempt()->where('quiz_id', $quiz->id)->first();
                if ($attempt) {
                    $quiz_attempted[] = ["quiz_id" => $quiz->id, "attempted" => true, "score" => $attempt->score];
                } else {
                    $quiz_attempted[] = ["quiz_id" => $quiz->id, "attempted" => false, "score" => null];
                }
            }
            return [
                'lesson_id' => $this->lesson->id,
                'lesson_title' => $this->lesson->title,
                'video_id' => $this->id,
                'video_title' => $this->title,
                'video_url' => $this->url,
                'video_thumbnail' => $this->thumbnail ? asset('storage/' . $this->thumbnail) : null,
                'created_at' => $this->created_at->format('Y-m-d h:i:s'),
                'quizzes_count' => $this->quizzes->count(),
                "quizzes" => $quiz_attempted,
                'views' => $this->views,
            ];
        }

        return [
            'lesson_id' => $this->lesson->id,
            'lesson_title' => $this->lesson->title,
            'video_id' => $this->id,
            'video_title' => $this->title,
            'video_url' => $this->url,
            'video_thumbnail' => $this->thumbnail ? asset('storage/' . $this->thumbnail) : null,
            'created_at' => $this->created_at->format('Y-m-d h:i:s'),
            'quizzes_count' => $this->quizzes->count(),
            'quizzes' => $this->quizzes->select('id', 'title')->toArray(),
            'views' => $this->views,
        ];
    }
}
