<?php

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Video>
 */
class VideoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'teacher_id' => function () {
                return Teacher::inRandomOrder()->value('id');
            },
            'lesson_id' => function (array $attributes) {
                $teacher = Teacher::find($attributes['teacher_id']);
                // Get a lesson that belongs to a unit under the teacher's subject
                return Lesson::whereHas('unit', function ($q) use ($teacher) {
                    $q->where('subject_id', $teacher->subject_id);
                })->inRandomOrder()->value('id');
            },
            'title' => $this->faker->sentence(),
            'url' => $this->faker->url(),
        ];
    }
}
