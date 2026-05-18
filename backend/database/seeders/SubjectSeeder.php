<?php

namespace Database\Seeders;

use App\Models\subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // subject::firstOrCreate(
        //     ['title' => 'الرياضيات', 'code' => 'MATH']
        // );
        subject::firstOrCreate(
            ['title' => 'الفيزياء', 'code' => 'PHYSICS']
        );
        // subject::firstOrCreate(
        //     ['title' => 'الأحياء', 'code' => 'BIOLOGY']
        // );
        // subject::firstOrCreate(
        //     ['title' => 'الكيمياء', 'code' => 'CHEMISTRY']
        // );

        // subject::(['name' => 'الرياضيات', 'code' => 'MATH']);
        // subject::create(['name' => 'الرياضيات', 'code' => 'MATH']);
        // subject::create(['name' => 'الفيزياء', 'code' => 'PHYSICS']);
        // subject::create(['name' => 'الأحياء', 'code' => 'BIOLOGY']);
        // subject::create(['name' => 'الكيمياء', 'code' => 'CHEMISTRY']);

    }
}
