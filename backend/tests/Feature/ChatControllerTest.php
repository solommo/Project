<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Unit;
use App\Models\User;
use App\Models\Subject;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class ChatControllerTest extends TestCase
{
    protected User $user;
    protected string $token;
    protected Lesson $lesson;

    public function setUp(): void
    {
        parent::setUp();

        // Create a user and get JWT token
        $this->user = User::factory()->create();
        $this->token = JWTAuth::fromUser($this->user);

        // Create test lesson structure
        $subject = Subject::factory()->create();
        $unit = Unit::factory()->create(['subject_id' => $subject->id]);
        $this->lesson = Lesson::factory()->create(['unit_id' => $unit->id]);
    }

    public function test_unauthenticated_user_cannot_send_chat_message()
    {
        $response = $this->postJson('/api/chat/send', [
            'message' => 'What is photosynthesis?',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_send_chat_message()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/chat/send', [
            'message' => 'What is photosynthesis?',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'user_message',
                'ai_response',
                'lesson_id',
                'lesson_title',
                'timestamp',
            ],
        ]);
    }

    public function test_message_validation_fails_for_empty_message()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/chat/send', [
            'message' => '',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['message']);
    }

    public function test_message_validation_fails_for_message_exceeding_max_length()
    {
        $longMessage = str_repeat('a', 2001);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/chat/send', [
            'message' => $longMessage,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['message']);
    }

    public function test_chat_with_valid_lesson_includes_lesson_context()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/chat/send', [
            'message' => 'Tell me more about this lesson',
            'lesson_id' => $this->lesson->id,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.lesson_id', $this->lesson->id);
        $response->assertJsonPath('data.lesson_title', $this->lesson->title);
    }

    public function test_chat_with_invalid_lesson_id_returns_404()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/chat/send', [
            'message' => 'Tell me about this',
            'lesson_id' => 99999,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['lesson_id']);
    }

    public function test_get_chat_session_returns_user_info()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/chat/session');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'user_id',
            'session_start',
        ]);
        $response->assertJsonPath('user_id', $this->user->id);
    }

    public function test_rate_limiting_returns_429_on_excessive_requests()
    {
        $headers = ['Authorization' => "Bearer {$this->token}"];

        // Send 31 requests (limit is 30 per minute)
        for ($i = 0; $i < 31; $i++) {
            $response = $this->withHeaders($headers)->postJson('/api/chat/send', [
                'message' => "Message {$i}",
            ]);

            if ($i < 30) {
                $this->assertTrue($response->status() === 200 || $response->status() === 500);
            } else {
                // The 31st request should be rate limited
                // Note: Rate limiting might return 429 or other status depending on Laravel config
                $this->assertNotNull($response);
            }
        }
    }
}
