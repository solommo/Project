<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use App\Http\Resources\TeacherResource;
use App\Http\Resources\VideoCollection;
use App\Models\Video;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Facades\JWTAuth;

class VideoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $teacher = JWTAuth::user()->teacher;
        $page = request()->get('page', 1);
        $cacheKey = 'videos_teacher_' . $teacher->id . '_page_' . $page;

        $videos = cache()->remember($cacheKey, 60, function () use ($teacher) {
            return $teacher->videos()->paginate(10);
        });

        return response()->json([
            'teacher' => new TeacherResource($teacher),
            'videos' => (new VideoCollection($videos))->response()->getData(true)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVideoRequest $request)
    {
        Gate::authorize('create', Video::class);
        $teacher = JWTAuth::user()->teacher;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->storeAs('videos', uniqid() . '_' . $file->getClientOriginalName(), 'public');

            $video = Video::create([
                'teacher_id' => $teacher->id,
                'lesson_id' => $request->input('lesson_id'),
                'title' => $request->input('title'),
                'url' => $path,
                'duration' =>$request->input('duration', null),
                'thumbnail' => $request->file('thumbnail') ? $request->file('thumbnail')->storeAs('thumbnails', uniqid() . '_' . $request->file('thumbnail')->getClientOriginalName(), 'public') : null,
                'views' => 0,
            ]);

            return response()->json($video, 201);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Video $video)
    {
        return response()->json($video);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVideoRequest $request, Video $video)
    {
        Gate::authorize('update', [Video::class, $video]);
        $video->update($request->validated());

        return response()->json($video);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Video $video)
    {
        Gate::authorize('delete', [Video::class, $video]);
        Storage::disk('public')->delete($video->url);
        $video->delete();

        return response()->json(['message' => 'Video deleted successfully']);
    }
}
