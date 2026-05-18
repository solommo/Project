<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// تشغيل التحديث يومياً الساعة 3 فجراً (وقت ميكونش فيه ضغط على السيرفر)
Schedule::command('subtopic:update-difficulty')->dailyAt('03:00');