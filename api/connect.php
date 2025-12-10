<?php
$DB_HOST = 'localhost';
$DB_NAME = 'car_booking';
$DB_USER = 'root';
$DB_PASS = '';

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}

// Ensure UTF-8
$mysqli->set_charset('utf8mb4');
?>
