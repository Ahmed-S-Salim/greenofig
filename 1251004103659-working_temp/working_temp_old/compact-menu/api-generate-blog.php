<?php
/**
 * API Proxy for Gemini Blog Generation
 * This bypasses CORS restrictions by making the API call from the server
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['prompt'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing prompt']);
    exit;
}

$gemini_api_key = 'AIzaSyBUH3HZjwbIzMqrk-RfxqqK5iU9TRiRrw0';

$gemini_request = [
    'contents' => [
        [
            'parts' => [
                ['text' => $data['prompt']]
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.7,
        'maxOutputTokens' => 4096
    ]
];

// Call Gemini API
$ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={$gemini_api_key}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($gemini_request));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    http_response_code($http_code);
    echo json_encode(['error' => "Gemini API error: $http_code", 'details' => $response]);
    exit;
}

// Return Gemini response
echo $response;
?>
