<?php

namespace Tests\Unit;

use App\Services\GeminiService;
use Google\Gemini\Client;
use PHPUnit\Framework\TestCase;

class GeminiServiceTest extends TestCase
{
    protected GeminiService $service;

    public function setUp(): void
    {
        parent::setUp();

        // Note: In a real test, you would mock the Google\Gemini\Client
        // For now, this is a basic structure test
    }

    public function test_build_system_prompt_with_lesson_title_and_description()
    {
        $service = new GeminiService();

        $prompt = $service->buildSystemPrompt(
            'Photosynthesis',
            'Learn how plants convert sunlight into energy',
            ['Light reactions', 'Calvin cycle', 'Chlorophyll']
        );

        $this->assertStringContainsString('Photosynthesis', $prompt);
        $this->assertStringContainsString('plants convert sunlight into energy', $prompt);
        $this->assertStringContainsString('Light reactions', $prompt);
        $this->assertStringContainsString('Calvin cycle', $prompt);
    }

    public function test_build_system_prompt_without_subtopics()
    {
        $service = new GeminiService();

        $prompt = $service->buildSystemPrompt(
            'Mathematics',
            'Basic algebra concepts'
        );

        $this->assertStringContainsString('Mathematics', $prompt);
        $this->assertStringContainsString('Basic algebra concepts', $prompt);
        $this->assertStringContainsString('educational assistant', $prompt);
    }

    public function test_build_system_prompt_contains_educational_context()
    {
        $service = new GeminiService();

        $prompt = $service->buildSystemPrompt(
            'History',
            'World War II events',
            ['Causes', 'Key battles', 'Aftermath']
        );

        // Should emphasize educational context
        $this->assertStringContainsString('educational assistant', $prompt);
        $this->assertStringContainsString('learn', strtolower($prompt));
    }
}
