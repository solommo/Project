<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnswerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'question' => $this->question->question,
            'student_answer' => $this->answer_text,
            'correctness' => $this->correctness,
            'question_subtopic' => $this->question->subtopic->title,
        ];
    }
}
