<?php

namespace App\Traits;

use DateTimeInterface;

trait HasFormattedTimestamps
{
    /**
     * Prepare a date for array / JSON serialization.
     */
    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
}
