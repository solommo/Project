<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QuizAttempt>
 */
class QuizAttemptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // 'student_id' => function () {
            //     return Student::inRandomOrder()->value('id') ?? Student::factory()->create()->id;
            // },
            // 'quiz_id' => function () {
            //     return Quiz::inRandomOrder()->value('id') ?? Quiz::factory()->create()->id;
            // },
            // 'score' => $score=StudentAnswer::where('quiz_id', $quiz->id)->where('student_id', $student->id)->where('correctness', true)->count(),
        ];
    }
}
