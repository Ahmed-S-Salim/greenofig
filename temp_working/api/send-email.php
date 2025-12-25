<?php
// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit();
}

$to = $input['to'] ?? null;
$subject = $input['subject'] ?? null;
$html = $input['html'] ?? null;
$from = $input['from'] ?? 'nutritionist@greenofig.com';

// Validate required fields
if (!$to || !$subject || !$html) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: to, subject, html']);
    exit();
}

// Validate email address
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}

// Email headers
$headers = array(
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: GreenoFig <' . $from . '>',
    'Reply-To: ' . $from,
    'X-Mailer: PHP/' . phpversion()
);

// Send email using PHP mail() - works on Hostinger
$success = mail($to, $subject, $html, implode("\r\n", $headers));

if ($success) {
    // Log successful email
    error_log("Email sent successfully to: $to | Subject: $subject");
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} else {
    error_log("Failed to send email to: $to | Subject: $subject");
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
?>
