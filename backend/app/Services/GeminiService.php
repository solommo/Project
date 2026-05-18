<?php

namespace App\Services;

use Google\Gemini\Client;
use Google\Gemini\GenerativeModel;

class GeminiService
{
    protected GenerativeModel $model;

    public function __construct()
    {
        $client = new Client(
            apiKey: config('services.gemini.api_key')
        );

        $this->model = $client->generativeModel(
            model: config('services.gemini.model')
        );
    }

    /**
     * Send a message to Gemini and get a response
     *
     * @param string $message The user's message
     * @param string|null $systemContext Optional system prompt/context
     * @return string The AI response
     * @throws \Exception If API call fails
     */
    public function chat(string $message, ?string $systemContext = null): string
    {
        try {
            $prompt = $systemContext
                ? "{$systemContext}\n\nUser: {$message}"
                : $message;

            $response = $this->model->generateContent($prompt);

            return $response->text();
        } catch (\Exception $e) {
            \Log::error('Gemini API Error', [
                'message' => $e->getMessage(),
                'user_message' => $message,
            ]);

            throw new \Exception('Failed to get response from AI service', 0, $e);
        }
    }

    /**
     * Build a system prompt for lesson context
     *
     * @param string $lessonTitle The title of the lesson
     * @param string $lessonDescription Brief description of lesson content
     * @param array $subtopics List of subtopics covered
     * @return string The system prompt
     */
    public function buildSystemPrompt(
        string $lessonTitle,
        string $lessonDescription,
        array $subtopics = []
    ): string {
        $context = "You are a helpful educational assistant. The student is currently learning about: **{$lessonTitle}**\n\n";
        $context .= "Lesson Content: {$lessonDescription}\n";

        if (!empty($subtopics)) {
            $context .= "\nTopics covered in this lesson:\n";
            foreach ($subtopics as $subtopic) {
                $context .= "- {$subtopic}\n";
            }
        }

        $context .= "\nProvide clear, concise answers focused on helping them understand this lesson better.";

        return $context;
    }
}
