<?php

namespace Database\Seeders;

use App\Models\Quiz;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $videos = \App\Models\Video::all();
        foreach ($videos as $video) {
            Quiz::factory()->create([
                'teacher_id' => $video->teacher_id,
                'video_id' => $video->id,
                'lesson_id' => $video->lesson_id,
            ]);
        }
    }
}
