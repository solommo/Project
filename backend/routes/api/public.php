<?php

use App\Http\Controllers\SubjectController;
use App\Http\Controllers\SubtopicController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

Route::get('test/{teacher}', [TeacherController::class, 'test']);
Route::get('landing_page', [LandingPageController::class, 'index']);
Route::get('subjects', [SubjectController::class, 'index']);
Route::get('subjects/{subject}/units', [UnitController::class, 'index']);
Route::get('units/{unit}/lessons', [LessonController::class, 'index']);
Route::get('lessons/{lesson}/subtopics', [SubtopicController::class, 'index']);

Route::get('subjects/{subject}/teachers', [TeacherController::class, 'index']);
Route::get('teachers/{teacher}/lessons', [TeacherController::class, 'show']);
Route::get('search/', [SearchController::class, 'search']);

Route::middleware('auth:api')->group(function () {
    Route::get('subjects/{subject}/subtopics', [SubjectController::class, 'showSubtopics']);
});
