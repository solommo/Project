<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;

class LandingPageController extends Controller
{
    public function index()
    {
        $subjects = Subject::withCount('teachers')->get();
        return response()->json([
            'message' => 'Welcome to the Focus Learning Platform API. Please refer to the documentation for usage details.'
        ,    'subjects' => $subjects,
            'subjects_count' => $subjects->count(),
            'all_teachers_count' => Teacher::count(),
            'all_students_count' => Student::count(),
        ]);

    }
}
