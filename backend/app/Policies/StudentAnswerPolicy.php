<?php

namespace App\Policies;

use App\Models\StudentAnswer;
use App\Models\User;

class StudentAnswerPolicy
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
    public function view(User $user, StudentAnswer $answer): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, StudentAnswer $answer): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function destroy(User $user, StudentAnswer $answer): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, StudentAnswer $answer): bool
    {
        return false;
    }
}
