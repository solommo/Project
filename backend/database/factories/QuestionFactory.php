<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\Subtopic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quiz_id' => function () {
                // Get a quiz that belongs to a lesson with subtopics
                return Quiz::whereHas('lesson.subtopics')->first()->id ?? Quiz::factory()->create()->id;
            },
            'subtopic_id' => function (array $attributes) {
                // Scope subtopic to the quiz's lesson
                $quiz = Quiz::find($attributes['quiz_id']);
                $subtopic = Subtopic::where('lesson_id', $quiz->lesson_id)->first();

                if (!$subtopic) {
                    // Fallback just in case
                    $subtopic = Subtopic::factory()->create(['lesson_id' => $quiz->lesson_id]);
                }
                return $subtopic->id;
            },
            'question' => $this->faker->sentence(),
            'option_1' => $this->faker->word(),
            'option_2' => $this->faker->word(),
            'option_3' => $this->faker->word(),
            'option_4' => $this->faker->word(),
            'correct_answer' => function (array $attributes) {
                // Pick one of the generated options
                return $this->faker->randomElement([
                    $attributes['option_1'],
                    $attributes['option_2'],
                    $attributes['option_3'],
                    $attributes['option_4']
                ]);
            },
        ];
    }
}
