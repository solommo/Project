<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Http\Resources\TeacherCollection;
use App\Models\Subject;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $page = request()->get('page', 1);
        $cacheKey = 'subjects_all_page_' . $page;

        $subjects = cache()->remember($cacheKey, 60, function () {
            return Subject::paginate(10);
        });
        return response()->json($subjects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubjectRequest $request)
    {
        $subject = Subject::create($request->validated());

        return response()->json($subject, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        return new TeacherCollection($subject->teachers);
    }

    public function showSubtopics(Subject $subject)
    {
        return $subject->load([
            'units:id,title,subject_id',
            'units.lessons:id,title,unit_id',
            'units.lessons.subtopics:id,title,lesson_id',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubjectRequest $request, Subject $subject)
    {
        $subject->update($request->validated());

        return response()->json($subject);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        $subject->delete();

        return response()->json(null, 204);
    }
}
