<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubtopicRequest;
use App\Http\Requests\UpdateSubtopicRequest;
use App\Models\Lesson;
use App\Models\Subject;
use App\Models\Subtopic;

class SubtopicController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Lesson $lesson)
    {
        return response()->json($lesson->subtopics()->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubtopicRequest $request, Subject $subject)
    {
        $subtopic = $subject->subtopics()->create($request->validated());

        return response()->json($subtopic, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject, Subtopic $subtopic)
    {
        return response()->json($subtopic);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubtopicRequest $request, Subject $subject, Subtopic $subtopic)
    {
        $subtopic->update($request->validated());

        return response()->json($subtopic);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject, Subtopic $subtopic)
    {
        $subtopic->delete();

        return response()->json(null, 204);
    }
}
