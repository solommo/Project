<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            'الوحدة الأولى: الكهربية التيارية والكهرومغناطيسية' => [
                'الفصل الأول: التيار الكهربى وقانون أوم وقانونا كيرتشوف',
                'الفصل الثاني: التأثير المغناطيسي والتيار الكهربى',
                'الفصل الثالث: الحث الكهرومغناطيسي',
                'الفصل الرابع: دوائر التيار المتردد',
            ],
            'الوحدة الثانية: مقدمة في الفيزياء الحديثة' => [
                'الفصل الخامس: ازدواجية الموجة والجسيم',
                'الفصل السادس: الأطياف الذرية',
                'الفصل السابع: اللليزر',
                'الفصل الثامن: الإلكترونيات الحديثة',
            ],
        ];

        foreach ($data as $unitTitle => $lessons) {
            $unit = Unit::where('title', $unitTitle)->first();

            if ($unit) {
                foreach ($lessons as $lessonTitle) {
                    $unit->lessons()->firstOrCreate(['title' => $lessonTitle]);
                }
            }
        }
    }
}
