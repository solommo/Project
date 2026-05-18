<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'role' => 'teacher',
            'teacher_name' => $this->user->name,
            'teacher_email' => $this->user->email,
            'teacher_profile_picture' => $this->user->profile_picture,
            'teacher_id' => $this->id,
            'user_id' => $this->user_id,
            'subject_id' => $this->subject_id,
            'subject_name' => $this->subject->title,
            'url' => $this->url,
            'created_at' => $this->created_at->format('Y-m-d h:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d h:i:s'),
        ];
    }
}
