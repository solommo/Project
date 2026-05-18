<?php

namespace App\Services;

use App\Models\Lesson;

class LessonContextBuilder
{
    /**
     * Build context information from a lesson
     *
     * @param Lesson $lesson The lesson to build context from
     * @param int $maxSubtopics Maximum number of subtopics to include
     * @return array Context array with title, description, and subtopics
     */
    public function buildContext(Lesson $lesson, int $maxSubtopics = 10): array
    {
        $subtopics = $lesson->subtopics()
            ->select('title')
            ->limit($maxSubtopics)
            ->get()
            ->pluck('title')
            ->toArray();

        return [
            'title' => $lesson->title,
            'description' => "Lesson: {$lesson->title}",
            'subtopics' => $subtopics,
        ];
    }

    /**
     * Get system prompt with lesson context
     *
     * @param Lesson $lesson The lesson to include as context
     * @return string The formatted system prompt
     */
    public function getSystemPrompt(Lesson $lesson): string
    {
        $context = $this->buildContext($lesson);

        $prompt = "You are a helpful educational assistant. The student is currently learning about: **{$context['title']}**\n\n";

        if (!empty($context['subtopics'])) {
            $prompt .= "Topics covered in this lesson:\n";
            foreach ($context['subtopics'] as $subtopic) {
                $prompt .= "- {$subtopic}\n";
            }
            $prompt .= "\n";
        }

        $prompt .= "Provide clear, concise answers focused on helping them understand this lesson better.";

        return $prompt;
    }
}
