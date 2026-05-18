<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student->id,
            'quiz_id' => $this->quiz->id,
            'quiz_title' => $this->quiz->title,
            'subject' => $this->quiz->lesson->subject(),
            'lesson_title' => $this->quiz->lesson->title,
            'video_title' => $this->quiz->video->title,
            'teacher_name' => $this->quiz->teacher->user->name,
            'score' => $this->score,
            'created_at' => $this->created_at->format('Y-m-d h:i:s'),
        ];
    }
}
