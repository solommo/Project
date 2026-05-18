<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Subtopic;
use App\Models\StudentAnswer;
use Illuminate\Support\Facades\DB;

class UpdateSkillDifficulty extends Command
{
    protected $signature = 'subtopic:update-difficulty';
    protected $description = 'Updates the difficulty_level of subtopics based on student performance statistics';

    public function handle()
    {
        try {
            $this->info('Starting subtopic difficulty update...');

            // Debug: Check total student answers
            $totalAnswers = StudentAnswer::count();
            $this->line("Total StudentAnswer records: $totalAnswers");

            // Get all subtopic stats in a single query
            $stats = StudentAnswer::selectRaw(
                'subtopic_id, COUNT(*) as total_attempts, SUM(CAST(correctness AS UNSIGNED)) as correct_answers'
            )
                ->groupBy('subtopic_id')
                ->get();

            $this->line("Found stats for " . count($stats) . " subtopics");

            $updated = 0;
            foreach ($stats as $stat) {
                $this->line("Processing: subtopic_id={$stat->subtopic_id}, attempts={$stat->total_attempts}, correct={$stat->correct_answers}");

                if (!$stat->subtopic_id) {
                    $this->warn("Skipping: subtopic_id is null or 0");
                    continue;
                }

                $subtopic = Subtopic::find($stat->subtopic_id);
                if (!$subtopic) {
                    $this->warn("Subtopic #{$stat->subtopic_id} not found");
                    continue;
                }

                $success_rate = $stat->correct_answers / $stat->total_attempts;
                $difficulty = max(0, min(1, 1 - $success_rate)); // Clamp 0-1

                $subtopic->update([
                    'subtopic_difficulty' => round($difficulty, 2)
                ]);

                $this->line("✓ Updated: [{$subtopic->title}] - Difficulty: " . round($difficulty, 2));
                $updated++;
            }

            $this->info("✓ Updated $updated subtopics successfully!");
        } catch (\Exception $e) {
            $this->error('Error updating subtopic difficulties: ' . $e->getMessage());
            return 1;
        }
    }
}
