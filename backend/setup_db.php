<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1', 'root', '');
    $pdo->exec('CREATE DATABASE IF NOT EXISTS focus_platform');
    echo "Database focus_platform created or already exists.\n";
} catch (Exception $e) {
    echo 'Error creating database: '.$e->getMessage()."\n";
    exit(1);
}

passthru('php artisan migrate --force');
