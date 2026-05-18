<?php

use App\Http\Controllers\TeacherController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->group(function () {
    Route::get('teachers/{teacher}/lessons/{lesson}/content', [TeacherController::class, 'showContent'])->scopeBindings();
    Route::get('teachers/dashboard', [TeacherController::class, 'TeacherDashboard'])->middleware(['role:teacher'])->scopeBindings();
    Route::apiResource('videos', VideoController::class)->middleware(['role:teacher']);
    Route::apiResource('quizzes', QuizController::class)->middleware(['role:teacher']);
    Route::get('quizzes-details/{quiz}', [TeacherController::class, 'showQuiz'])->scopeBindings();
});
