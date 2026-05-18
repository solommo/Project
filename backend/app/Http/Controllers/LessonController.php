<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\Unit;

class LessonController extends Controller
{
    /**
     * Get lessons in a unit.
     * GET /api/units/{id}/lessons
     */
    public function index(Unit $unit)
    {
        return response()->json($unit->lessons()->paginate(10));
    }

    /**
     * Get lesson details + list of videos and quizzes (grouped by teacher logic handles this via existing relations).
     * GET /api/lessons/{id}
     */
    public function show(Lesson $lesson)
    {
        return response()->json([
            'lesson' => $lesson,
            'videos' => $lesson->videos()->with('teacher:id,user_id')->paginate(10, ['*'], 'video_page'),
            'quizzes' => $lesson->quizzes()->with('teacher:id,user_id')->paginate(10, ['*'], 'quiz_page'),
        ]);
    }
}
