<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;
use App\Models\Video;

class QuizPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, quiz $quiz): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, video $video): bool
    {
        if ($user->hasRole('teacher') && $user->teacher->id == $video->teacher_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, quiz $quiz): bool
    {
        if ($user->hasRole('teacher') && $user->teacher->id == $quiz->teacher_id) {
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, quiz $quiz): bool
    {
            if ($user->hasRole('teacher') && $user->teacher->id == $quiz->teacher_id) {
                return true;
            }
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, quiz $quiz): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, quiz $quiz): bool
    {
        return false;
    }
}
