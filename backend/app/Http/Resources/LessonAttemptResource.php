<?php

namespace App\Http\Resources;

use App\Models\Quiz;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonAttemptResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
//    dd($this);


        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'lesson_id' => $this->lesson_id,
            'video_id' => $this->video_id,
            'quiz_id'=>$this->quiz_id,
            'video_title' => $this->video->title,
            'quiz_title' => $this->quiz ? $this->quiz->title : null,
            'quiz_attempted' => $this->quiz_attempted,
            'lesson_title' => $this->lesson->title,
            'student_name' => $this->student->user->name,
            'student_email' => $this->student->user->email,
            'score' => $this->quiz_id ? $this->student->quizzesAttempt()->where('quiz_id', $this->quiz_id)->value('score') : null,
            'total_marks' => $this->quiz_id ? $this->quiz->total_marks : null,
            'attempted_at' => $this->created_at->format('Y-m-d H:i:s'),
            
        ];
    }
}
