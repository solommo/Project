<?php

namespace Database\Seeders;

use App\Models\Video;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class VideoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure each teacher has at least one video
        $teachers = Teacher::all();
        foreach ($teachers as $teacher) {
            Video::factory()->create([
                'teacher_id' => $teacher->id,
            ]);
        }

        // Create some additional random videos
        // Video::factory(30)->create();
    }
}
