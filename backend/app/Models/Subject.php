<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    /** @use HasFactory<\Database\Factories\SubjectFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
    ];

    protected static function booted()
    {
        static::saved(fn () => cache()->forget('subjects_all_all'));
        static::deleted(fn () => cache()->forget('subjects_all_all'));
    }

    public function teachers()
    {
        return $this->hasMany(Teacher::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }
}
