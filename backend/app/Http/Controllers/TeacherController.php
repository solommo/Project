<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreteacherRequest;
use App\Http\Requests\UpdateteacherRequest;
use App\Http\Resources\LessonAttempResource;
use App\Http\Resources\LessonAttemptCollection;
use App\Http\Resources\LessonCollection;
use App\Http\Resources\quizResource;
use App\Http\Resources\TeacherCollection;
use App\Http\Resources\teacherResource;
use App\Http\Resources\VideoCollection;
use App\Http\Resources\VideoResource;
use App\Models\Lesson;
use App\Models\LessonAttempt;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Video;
use Tymon\JWTAuth\Facades\JWTAuth;

class TeacherController extends Controller
{
    public function test(Teacher $teacher)
    {
        // dd($teacher);
        $points = QuizAttempt::whereHas('quiz', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->avg(\DB::raw('(score / NULLIF((SELECT COUNT(*) FROM questions WHERE questions.quiz_id = quiz_attempts.quiz_id), 0)) * 100'));
        $points = round((float) $points, 2);



        return [$points];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Subject $subject)
    {
        $page = request()->get('page', 1);
        $cacheKey = 'teachers_subject_' . $subject->id . '_page_' . $page;

        $teachers = cache()->remember($cacheKey, 60, function () use ($subject) {
            return $subject->teachers()->paginate(10);
        });

        // Use response()->json() with custom data structure while preserving pagination via getData(true)
        return response()->json([
            'teachers' => (new TeacherCollection($teachers))->response()->getData(true)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreteacherRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Teacher $teacher)
    {
        $lessons = $teacher->lessons()
            ->select('lessons.id', 'lessons.title')
            ->distinct()
            ->paginate(10)
            ->through(function ($lesson) {
                return $lesson->makeHidden('laravel_through_key');
            });

        return ['teacher' => new TeacherResource($teacher), 'lessons' => $lessons];
    }

    public function showContent(Teacher $teacher, Lesson $lesson)
    {
        // Record the lesson attempt
        if (JWTAuth::user() && JWTAuth::user()->hasRole('student')) {
            $videos = $teacher->videos()->where('lesson_id', $lesson->id)->first();
            $videos->update(['views' => $videos->views + 1]);

            $student = JWTAuth::user()->student;
            // dd($student);
            // Create a lesson attempt if it doesn't already exist for this attempt session
            LessonAttempt::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'lesson_id' => $lesson->id,
                    'video_id' => $videos->id,
                    'teacher_id' => $teacher->id,
                ]
            );


            return response()->json([
                'teacher' => new TeacherResource($teacher),
                'videos' => (new VideoResource($videos)),
                // 'quizzes' => (new quizResource($videos->quizzes()->first())),
            ]);
        }
    }

    public function showQuiz(Quiz $quiz)
    {
        // dd($teacher->videos->quiz);
        if (JWTAuth::user() && JWTAuth::user()->hasRole('student')) {
            $student = JWTAuth::user()->student;
            if ($student->quizzesAttempt->where('quiz_id', $quiz->id)->first()) {
                return response()->json([
                    'message' => 'you attempt this quiz ',
                ]);
            }
        }

        $teacher = $quiz->teacher;


        return ['teacher' => new TeacherResource($teacher), 'quiz' => new QuizResource($quiz)];
        // return (new teacherResource($teacher))->additional([ 'quiz'=> new quizResource($quiz)]);
        // return (new teacherResource($teacher))->additional([ 'lessons'=> $teacher->videos->load('lesson:id,title')->pluck('lesson')]);
    }
    public function TeacherDashboard()
    {
        // dd($teacher);
        $teacher = JWTAuth::user()->teacher;
        $videos_count = $teacher->videos()->count();
        $quizzes_count = $teacher->quizzes()->count();
        $teacher = JWTAuth::user()->teacher;
        $students_points = QuizAttempt::whereHas('quiz', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->select('score')->sum('score');

        // $all_possible_points = QuizAttempt::whereHas('quiz', function ($q) use ($teacher) {
        //     $q->where('teacher_id', $teacher->id);
        // })->with(['quiz' => function ($query) {
        //     // This adds a 'questions_count' to each loaded Quiz model
        //     $query->withCount('questions');
        // }])->get()->sum('quiz.questions_count');


        $all_possible_points = QuizAttempt::whereHas('quiz', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->with('quiz')->get()->sum('quiz.total_marks');
        // return($all_possible_points);
            $percentage = $quizzes_count > 0 && $all_possible_points > 0 ? round($students_points / $all_possible_points, 2)*100 : 0;



        // $student_attempts =  ($teacher->lessons()->where('lessons.id',"5")->first()->attempts);
        return response()->json([
            'teacher' => (new TeacherResource($teacher)),
            'videos_count' => $videos_count,
            'quizzes_count' => $quizzes_count,
            'average_score' => $percentage . '%',
            'quiz_attempts_count' => $teacher->quizzes()->withCount('quizzesAttempt')->get(),

            'student_attempts' => new LessonAttemptCollection($teacher->lessonAttempts()->orderBy('student_id')->get()),
        ]);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeacherRequest $request, Teacher $teacher)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher)
    {
        //
    }
}
