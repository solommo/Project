<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $quizzes = \App\Models\Quiz::all();
        foreach ($quizzes as $quiz) {
            $subtopic = \App\Models\Subtopic::where('lesson_id', $quiz->lesson_id)->first();
            if (!$subtopic) {
                $subtopic = \App\Models\Subtopic::factory()->create(['lesson_id' => $quiz->lesson_id]);
            }

            // Create 30 questions per quiz explicitly
            for ($i = 0; $i < 30; $i++) {
                Question::factory()->create([
                    'quiz_id' => $quiz->id,
                    'subtopic_id' => $subtopic->id,
                ]);
            }
        }
    }
}
