<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'resource_type',
        'resource_id',
        'reason',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Resolve the actual resource (Video or Quiz) polymorphically.
     */
    public function resource()
    {
        return match ($this->resource_type) {
            'video' => $this->belongsTo(Video::class, 'resource_id'),
            'quiz' => $this->belongsTo(Quiz::class, 'resource_id'),
            default => null,
        };
    }
}
