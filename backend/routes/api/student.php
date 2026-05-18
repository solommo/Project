<?php

use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\StudentAnswerController;
use App\Http\Controllers\StudentController;
use App\Models\Student;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->group(function () {
    // Route::post('attempts/{attempt}/answer', [QuizAttemptController::class, 'answer'])->middleware(['role:student']);
    Route::post('quiz/{quiz}/answer', [StudentAnswerController::class, 'answer'])->middleware(['role:student']);
    // Route::get('students/attempts', [QuizAttemptController::class, 'index'])->middleware(['role:student']);
    Route::get('student/dashboard', [StudentController::class, 'index'])->middleware(['role:student'])->scopeBindings();
    Route::get('student/answers/{quiz}', [StudentController::class, 'subtopicEvaluation'])->middleware(['role:student']);
    });

Route::match(['get', 'post'], 'aiTest', [StudentController::class, 'aiTest']);
