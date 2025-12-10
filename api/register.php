<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Ensure users table exists
$createSql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
$mysqli->query($createSql);

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

if ($name === '') {
    $name = strstr($email, '@', true) ?: 'User';
}

// Check if user exists
$check = $mysqli->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
if (!$check) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit;
}
$check->bind_param('s', $email);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already registered']);
    $check->close();
    exit;
}
$check->close();

$hash = password_hash($password, PASSWORD_DEFAULT);
$insert = $mysqli->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
if (!$insert) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit;
}
$insert->bind_param('sss', $name, $email, $hash);
if (!$insert->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to register user']);
    $insert->close();
    exit;
}
$insert->close();

$_SESSION['user_id'] = $mysqli->insert_id;
$_SESSION['user_email'] = $email;
$_SESSION['user_name'] = $name;

echo json_encode(['success' => true, 'name' => $name, 'email' => $email]);
