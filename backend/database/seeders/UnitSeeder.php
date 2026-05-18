<?php

namespace Database\Seeders;

use App\Models\subject;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        subject::where('code', 'PHYSICS')->first()->units()->firstOrCreate(
            ['title' => 'الوحدة الأولى: الكهربية التيارية والكهرومغناطيسية']);
        subject::where('code', 'PHYSICS')->first()->units()->firstOrCreate(
            ['title' => 'الوحدة الثانية: مقدمة في الفيزياء الحديثة']);
    }
}
