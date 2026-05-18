<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\Student;
use App\Models\QuizAttempt;
use App\Models\StudentAnswer;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class StudentAnswerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        $students = Student::all();
        $quizzes = Quiz::with('questions')->get();

        if ($quizzes->isEmpty() || $students->isEmpty()) {
            return; // Safety guard
        }

        foreach ($students as $student) {
            // Student randomly takes up to 3 quizzes
            $takeCount = rand(1, min(3, $quizzes->count()));
            $randomQuizzes = $quizzes->random($takeCount);

            foreach ($randomQuizzes as $quiz) {
                $questions = $quiz->questions;

                // Ensure exactly 30, but taking whatever questions the quiz has
                $score = 0;
                $answersData = [];

                foreach ($questions as $question) {
                    // Answer text picked randomly from options. Correctness evaluated.
                    $options = array_filter([
                        $question->option_1,
                        $question->option_2,
                        $question->option_3,
                        $question->option_4
                    ]);

                    if (empty($options)) {
                        continue;
                    }

                    $pickedAnswer = $faker->randomElement($options);
                    $isCorrect = ($pickedAnswer === $question->correct_answer);

                    if ($isCorrect) {
                        $score++;
                    }

                    $answersData[] = [
                        'student_id'  => $student->id,
                        'quiz_id'     => $quiz->id,
                        'question_id' => $question->id,
                        'subtopic_id' => $question->subtopic_id,
                        'answer_text' => $pickedAnswer,
                        'correctness' => $isCorrect,
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ];
                }

                // Batch insert all the answers for this attempt efficiently
                if (!empty($answersData)) {
                    StudentAnswer::insert($answersData);
                }

                // Generate a QuizAttempt with the calculated score based on those answers
                QuizAttempt::create([
                    'student_id'   => $student->id,
                    'quiz_id'      => $quiz->id,
                    'score'        => $score,
                    'started_at'   => now()->subMinutes(30),
                    'completed_at' => now(),
                ]);
            }
        }
    }
}
