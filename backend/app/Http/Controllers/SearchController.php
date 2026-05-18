<?php

namespace App\Http\Controllers;

use App\Http\Resources\QuizCollection;
use App\Http\Resources\LessonCollection;
use App\Http\Resources\TeacherCollection;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\Subject;
use App\Models\Subtopic;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class SearchController extends Controller
{
    public function search(Request $request)
    {

        // switch ($request->query('type')) {
        //     case 'teacher':
        //         $results = Teacher::with('user')->whereHas('user', function ($query) use ($request) {
        //             $query->where('name', 'like', '%' . $request->query('value') . '%');
        //         })->get();
        //         return response()->json(['teachers' => new TeacherCollection($results)]);
        //         break;
        //     case 'subject':
        //         $results = Subject::where('title', 'like', '%' . $request->query('value') . '%')->get();
        //         return response()->json(['subjects' => $results]);
        //         break;
        //     case 'quiz':
        //         $results = Quiz::where('title', 'like', '%' . $request->query('value') . '%')->get();
        //         return response()->json(['quizzes' => new QuizCollection($results)]);
        //         break;
        //     case 'lesson':
        //         $results = Lesson::where('title', 'like', '%' . $request->query('value') . '%')->get();
        //         return response()->json(['lessons' => $results]);

        //         break;
        //         // Implement lesson search logic here
        //     default:
        //         return response()->json(['error' => 'Invalid search type'], 400);
        // }
        $search_statment = $request->query('statement');
        // return response()->json([
        //             'search_statement' => $search_statment,
        // ]);
        $teachers = Teacher::whereHas('user', function ($query) use ($search_statment) {
            $query->where('name', 'like', '%' . $search_statment . '%');
        })->get();
        // return response()->json([
        //     'teachers' => new TeacherCollection($teachers),
        // ]);
        $lessons = Lesson::select(
            'lessons.id',
            'lessons.title',
            'teachers.id as teacher_id',
            'users.name as teacher_name',
            'users.profile_picture as teacher_profile_picture',
            \DB::raw("'lesson' as search_type")
        )
            ->join('videos', 'lessons.id', '=', 'videos.lesson_id')
            ->join('teachers', 'videos.teacher_id', '=', 'teachers.id')
            ->join('users', 'teachers.user_id', '=', 'users.id')
            ->where('lessons.title', 'like', '%' . $search_statment . '%')
            ->distinct() // Important: prevents duplicate lessons if a lesson has multiple videos from the same teacher
            ->get();
        // return response()->json([
        //     'teachers' => new TeacherCollection($teachers),
        //     'lessons' => $lessons,
        // ]);
        $subtopics = Subtopic::select(
            'subtopics.id',
            'subtopics.title',
            'lessons.id as lesson_id',
            'lessons.title as lesson_title',
            'teachers.id as teacher_id',
            'users.name as teacher_name',
            'users.profile_picture as teacher_profile_picture',
            \DB::raw("'subtopic' as search_type")
        )
            ->join('lessons', 'subtopics.lesson_id', '=', 'lessons.id')
            ->join('videos', 'lessons.id', '=', 'videos.lesson_id')
            ->join('teachers', 'videos.teacher_id', '=', 'teachers.id')
            ->join('users', 'teachers.user_id', '=', 'users.id')
            ->where('subtopics.title', 'like', '%' . $search_statment . '%')
            ->distinct()
            ->get();
        // return response()->json([
        //     'teachers' => new TeacherCollection($teachers),
        //     'lessons' => $lessons,
        //     'subtopics' => $subtopics,
        // ]);

        $formattedTeachers = collect((new TeacherCollection($teachers))->resolve())->map(function ($item) {
            $itemArray = (array) $item;
            $itemArray['search_type'] = 'teacher';
            return $itemArray;
        });

        $combined = $formattedTeachers->concat($lessons)->concat($subtopics);

        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);
        $paginatedItems = $combined->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $paginatedItems,
            $combined->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return response()->json($paginator);
        // $query = request()->get('q', '');
        // Implement search logic here, e.g., search teachers by name or subject
        // $teachers = Teacher::where('name', 'like', '%' . $query . '%')->get();
        // return response()->json(['teachers' => $teachers]);                          
    }
}
