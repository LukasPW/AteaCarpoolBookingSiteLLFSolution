<?php
// Returns cars with embedded bookings in the same shape as the previous cars.json
// Path: /api/get_cars.php

header('Content-Type: application/json');
require_once __DIR__ . '/connect.php';

$sql = "SELECT c.id, c.make, c.model, c.year, c.fuel_type, c.seats, c.body_style, c.license_plate, c.image,
               b.start_datetime, b.end_datetime, b.booked_by
        FROM cars c
        LEFT JOIN bookings b ON b.car_id = c.id
        ORDER BY c.id, b.start_datetime";

$result = $mysqli->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . $mysqli->error]);
    exit;
}

$cars = [];
while ($row = $result->fetch_assoc()) {
    $id = (int)$row['id'];
    if (!isset($cars[$id])) {
        $cars[$id] = [
            'id' => $id,
            'make' => $row['make'],
            'model' => $row['model'],
            'year' => (int)$row['year'],
            'fuel_type' => $row['fuel_type'],
            'seats' => (int)$row['seats'],
            'body_style' => $row['body_style'],
            'license_plate' => $row['license_plate'],
            'image' => $row['image'],
            'bookings' => []
        ];
    }

    // Add booking if present
    if (!empty($row['start_datetime']) && !empty($row['end_datetime'])) {
        $cars[$id]['bookings'][] = [
            'start' => date('c', strtotime($row['start_datetime'])),
            'end'   => date('c', strtotime($row['end_datetime'])),
            'bookedBy' => $row['booked_by']
        ];
    }
}

// Return as zero-indexed array
echo json_encode(array_values($cars));
?>
