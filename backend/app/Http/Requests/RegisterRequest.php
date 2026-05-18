<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    // public function authorize(): bool
    // {
    //     return false;
    // }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'teacher' => 'required_without:student|boolean|prohibited_if:student,true',
            'student' => 'required_without:teacher|boolean|prohibited_if:teacher,true',
            'subject_id' => 'required_if:teacher,true|integer|max:255|exists:subjects,id',
            'profile_picture' => 'nullable|image|max:2048|not_required',

        ];
    }
}
