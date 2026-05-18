<?php

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\Teacher;
use App\Models\Video;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quiz>
 */
class QuizFactory extends Factory
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
                // Ensure teacher has videos, or fallback to any teacher (video will be created if needed)
                return Teacher::whereHas('videos')->first()->id ?? Teacher::factory()->create()->id;
            },
            'video_id' => function (array $attributes) {
                // Use a video from the selected teacher, or create one if none exist
                $video = Video::where('teacher_id', $attributes['teacher_id'])->first();
                if (!$video) {
                    $video = Video::factory()->create(['teacher_id' => $attributes['teacher_id']]);
                }
                return $video->id;
            },
            'lesson_id' => function (array $attributes) {
                // Lesson must match the lesson of the video
                $video = Video::find($attributes['video_id']);
                return $video->lesson_id;
            },
            'title' => $this->faker->sentence(3) . ' Quiz',
            'time_limit' => $this->faker->randomElement([15, 30, 45, 60]),
            'total_marks' => 30,
        ];
    }
}
