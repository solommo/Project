<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user_message' => $this['user_message'],
            'ai_response' => $this['ai_response'],
            'lesson_id' => $this['lesson_id'] ?? null,
            'lesson_title' => $this['lesson_title'] ?? null,
            'timestamp' => $this['timestamp'] ?? now()->toIso8601String(),
        ];
    }
}
