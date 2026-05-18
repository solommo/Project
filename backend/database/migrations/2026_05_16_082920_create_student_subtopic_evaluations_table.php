<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_subtopic_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subtopic_id')->constrained()->onDelete('cascade');
            
            $table->float('subtopic_evaluation', 10, 2)->nullable();
            $table->string('evaluation_status', 50)->nullable();
            $table->integer('question_count')->nullable();
            $table->integer('correct_count')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_subtopic_evaluations');
    }
};
