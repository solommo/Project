<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\Quiz;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudentAnswer>
 */
class StudentAnswerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quiz_id = Quiz::inRandomOrder()->value('id');
        $student_id = Student::inRandomOrder()->value('id');

        return [
            'quiz_id' => $quiz_id,
            'student_id' => $student_id,
            'question_id' => function (array $attributes) {
                // Return a question that belongs to the same quiz and hasn't been answered by this student yet
                $answeredQuestionIds = \App\Models\StudentAnswer::where('student_id', $attributes['student_id'])
                    ->where('quiz_id', $attributes['quiz_id'])
                    ->pluck('question_id')
                    ->toArray();

                $question = \App\Models\Question::where('quiz_id', $attributes['quiz_id'])
                    ->whereNotIn('id', $answeredQuestionIds)
                    ->inRandomOrder()
                    ->first();

                if (!$question) {
                    $question = \App\Models\Question::inRandomOrder()->where('quiz_id', $attributes['quiz_id'])->first() ?? \App\Models\Question::factory()->create(['quiz_id' => $attributes['quiz_id']]);
                }
                return $question->id;
            },
            'answer_text' => function (array $attributes) {
                $question = \App\Models\Question::find($attributes['question_id']);
                if ($question) {
                    return $this->faker->randomElement([
                        $question->option_1,
                        $question->option_2,
                        $question->option_3,
                        $question->option_4
                    ]);
                }
                return $this->faker->word();
            },
            'correctness' => function (array $attributes) {
                $question = \App\Models\Question::find($attributes['question_id']);
                if ($question) {
                    return $attributes['answer_text'] === $question->correct_answer;
                }
                return false;
            },
        ];
    }
}
