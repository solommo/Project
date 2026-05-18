<?php

namespace App\Http\Controllers;

use App\Models\Subject;

class UnitController extends Controller
{
    /**
     * Get units of a subject.
     * GET /api/subjects/{id}/units
     */
    public function index(Subject $subject)
    {
        return response()->json($subject->units()->paginate(10));
    }
}
