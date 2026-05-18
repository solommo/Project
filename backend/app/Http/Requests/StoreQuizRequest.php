<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorequizRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'video_id' => 'required|integer',
            'questions' => 'required|array|min:1', // Assuming at least one question
            'questions.*.question' => 'required|string',
            'questions.*.option' => 'required|array',
            'questions.*.correct_answer' => 'required|string',
            'questions.*.subtopic_id' => 'required|integer|exists:subtopics,id',
            'questions.*.difficulty' => 'nullable|string|max:255',
            'questions.*.cognitive_skill' => 'nullable|string',
            
            ];
            
    }
}
