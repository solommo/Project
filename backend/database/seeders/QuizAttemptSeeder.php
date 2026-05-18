<?php

namespace Database\Seeders;

use App\Models\QuizAttempt;
use Illuminate\Database\Seeder;

class QuizAttemptSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        QuizAttempt::factory(30)->create();
    }
}
