<?php
/**
 * Hostinger Cron Job Script for Auto Blog Generation
 * This script is called by Hostinger cron job to automatically generate blog posts
 *
 * Setup: Place this file in public_html/ directory
 * Cron command: /usr/bin/php /home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php
 * Schedule: 0 9 * * 1,3,5 (Mon, Wed, Fri at 9 AM)
 */

// Security: Check if running from command line (cron) or add a secret key
$secret_key = 'greenofig_auto_blog_2025'; // Change this to something secure

if (php_sapi_name() !== 'cli') {
    // If accessed via browser, require secret key
    if (!isset($_GET['key']) || $_GET['key'] !== $secret_key) {
        http_response_code(403);
        die('Access denied');
    }
}

// Configuration
$supabase_url = 'https://xdzoikocriuvgkoenjqk.supabase.co';
$supabase_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkem9pa29jcml1dmdrb2VuanFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMzg2NzUsImV4cCI6MjA3NTkxNDY3NX0.hh2GkNEdFHI9wlPfM6-oDraPz-s-zS1HlJpSTElQxHc';
$gemini_api_key = 'AIzaSyBUH3HZjwbIzMqrk-RfxqqK5iU9TRiRrw0'; // Your Gemini API key

$log_file = __DIR__ . '/cron-blog-log.txt';

function log_message($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}

function make_supabase_request($endpoint, $method = 'GET', $data = null) {
    global $supabase_url, $supabase_anon_key;

    $url = $supabase_url . '/rest/v1/' . $endpoint;

    $headers = [
        'apikey: ' . $supabase_anon_key,
        'Authorization: Bearer ' . $supabase_anon_key,
        'Content-Type: application/json',
        'Prefer: return=representation'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'PATCH') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code >= 400) {
        log_message("Error: HTTP $http_code - $response");
        return null;
    }

    return json_decode($response, true);
}

log_message("=== Cron Job Started ===");

// Step 1: Check scheduler settings
log_message("Checking scheduler settings...");
$settings = make_supabase_request('platform_settings?key=eq.auto_blog_scheduler&select=*');

if (!$settings || empty($settings)) {
    log_message("Scheduler settings not found or disabled");
    exit(0);
}

$config = $settings[0]['value'];

if (!$config['enabled']) {
    log_message("Scheduler is disabled. Skipping.");
    exit(0);
}

log_message("Scheduler is enabled. Posts per week: " . $config['postsPerWeek']);

// Step 2: Get next topic from queue
log_message("Fetching next topic from queue...");
$topics = make_supabase_request('blog_content_queue?status=eq.pending&order=priority.desc&limit=1');

if (!$topics || empty($topics)) {
    log_message("No pending topics in queue");
    exit(0);
}

$topic = $topics[0];
log_message("Found topic: " . $topic['topic']);

// Step 3: Mark topic as generating
log_message("Marking topic as generating...");
make_supabase_request(
    'blog_content_queue?id=eq.' . $topic['id'],
    'PATCH',
    ['status' => 'generating']
);

// Step 4: Call Gemini API
log_message("Generating content with Gemini AI...");

$prompt = "You are an expert SEO content writer specializing in health, wellness, nutrition, and fitness.

Create a comprehensive, SEO-optimized blog post with the following specifications:

**Topic**: {$topic['topic']}
**Target Keywords**: {$topic['keywords']}
**Target Audience**: Health-conscious individuals seeking AI-powered wellness solutions
**Content Type**: Ultimate Guide
**Tone**: Professional yet friendly
**Target Word Count**: 2000+ words

**Requirements**:
1. Create a compelling, click-worthy headline (50-60 characters)
2. Write an engaging meta description (150-160 characters)
3. Start with a hook that grabs attention
4. Use H2 and H3 headers for structure (include keywords naturally)
5. Include actionable tips and practical advice
6. Add internal linking suggestions [use format: [Link Text]]
7. Include a call-to-action at the end
8. Naturally integrate the target keywords throughout
9. Make it valuable, informative, and engaging
10. Write in markdown format with proper formatting

**CRITICAL**: You must respond with ONLY a valid JSON object. Do not include any text before or after the JSON. Do not wrap the JSON in markdown code blocks. Just return the raw JSON.

Required JSON structure:
{
  \"title\": \"Your SEO-optimized blog title here\",
  \"slug\": \"url-friendly-slug-here\",
  \"metaDescription\": \"Your compelling 150-160 char meta description\",
  \"content\": \"# Your Blog Title\\n\\nYour full blog post content in markdown format with headers, paragraphs, lists, etc. Make this 2000+ words.\",
  \"excerpt\": \"A 2-3 sentence excerpt summarizing the post for preview cards\"
}

Generate the blog post now. Return ONLY the JSON object with no additional text, explanations, or markdown wrappers.";

$gemini_request = [
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt]
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

$ai_response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    log_message("Gemini API failed: HTTP $http_code - $ai_response");
    make_supabase_request(
        'blog_content_queue?id=eq.' . $topic['id'],
        'PATCH',
        [
            'status' => 'failed',
            'error_message' => "HTTP $http_code: $ai_response"
        ]
    );
    exit(1);
}

$ai_data = json_decode($ai_response, true);

if (!isset($ai_data['candidates'][0]['content']['parts'][0]['text'])) {
    log_message("Invalid Gemini response");
    make_supabase_request(
        'blog_content_queue?id=eq.' . $topic['id'],
        'PATCH',
        [
            'status' => 'failed',
            'error_message' => 'Invalid Gemini response'
        ]
    );
    exit(1);
}

// Parse Gemini response
$response_text = $ai_data['candidates'][0]['content']['parts'][0]['text'];
log_message("Raw Gemini response length: " . strlen($response_text));

// Extract JSON from markdown code blocks if present (more flexible regex)
$json_extracted = false;
$blog_data = null;

// Try multiple patterns to extract JSON
if (preg_match('/```json\s*\n([\s\S]*?)\n```/s', $response_text, $json_matches)) {
    // Found JSON in code block
    $json_string = trim($json_matches[1]);
    log_message("Extracted JSON from code block");
    $blog_data = json_decode($json_string, true);
    if ($blog_data && is_array($blog_data)) {
        $json_extracted = true;
    }
}

// If that didn't work, try to find JSON object directly
if (!$json_extracted && preg_match('/\{[\s\S]*\}/s', $response_text, $json_matches)) {
    $json_string = trim($json_matches[0]);
    log_message("Extracted JSON directly");
    $blog_data = json_decode($json_string, true);
    if ($blog_data && is_array($blog_data)) {
        $json_extracted = true;
    }
}

// Validate extracted data has required fields
if ($json_extracted && $blog_data) {
    if (!isset($blog_data['title']) || !isset($blog_data['content'])) {
        log_message("Warning: JSON missing required fields");
        $json_extracted = false;
    } else {
        // Clean up content - remove any markdown code block wrappers
        $blog_data['content'] = preg_replace('/^```json[\s\S]*?```\s*/s', '', $blog_data['content']);
        $blog_data['content'] = preg_replace('/^```[\s\S]*?```\s*/s', '', $blog_data['content']);
        $blog_data['content'] = trim($blog_data['content']);
        log_message("Content cleaned, length: " . strlen($blog_data['content']));
    }
}

// Fallback if parsing failed
if (!$json_extracted) {
    log_message("Could not parse JSON from Gemini response - using fallback");
    // Strip any JSON code blocks and use just the markdown content
    $clean_content = preg_replace('/```json[\s\S]*?```\s*/s', '', $response_text);
    $clean_content = trim($clean_content);

    $blog_data = [
        'title' => $topic['topic'],
        'slug' => strtolower(preg_replace('/[^a-z0-9]+/', '-', $topic['topic'])),
        'metaDescription' => substr($clean_content, 0, 160),
        'content' => $clean_content,
        'excerpt' => substr($clean_content, 0, 200),
        'keywords' => explode(',', $topic['keywords']),
        'readingTime' => ceil(str_word_count($clean_content) / 200),
        'seoScore' => 75
    ];
}

log_message("Content generated successfully: " . $blog_data['title']);

// Step 5: Save to blog_posts table
log_message("Saving blog post to database...");

$auto_publish = $config['autoPublish'] ?? false;

// Clean content - remove any JSON artifacts, code blocks, or HTML
$clean_content = $blog_data['content'];

// Remove any stray JSON at the start
$clean_content = preg_replace('/^```json[\s\S]*?```\s*/s', '', $clean_content);
$clean_content = preg_replace('/^\{[\s\S]*?\}\s*\n*/s', '', $clean_content);

// Remove any HTML tags if present (AI sometimes adds them)
$clean_content = preg_replace('/<[^>]+>/', '', $clean_content);

// Trim whitespace
$clean_content = trim($clean_content);

$blog_post = [
    'title' => $blog_data['title'],
    'slug' => $blog_data['slug'],
    'content' => $clean_content,
    'content_format' => 'markdown',
    'excerpt' => $blog_data['excerpt'] ?? substr(strip_tags($clean_content), 0, 200),
    'meta_description' => $blog_data['metaDescription'] ?? substr(strip_tags($clean_content), 0, 160),
    'author_id' => 'a34c89b6-8b5c-4caf-8ed5-ab36c90acc97', // Your admin user ID
    'status' => $auto_publish ? 'published' : 'draft',
    'ai_generated' => true,
    'created_at' => date('c'),
    'published_at' => $auto_publish ? date('c') : null
];

log_message("Blog post data prepared - Title: " . $blog_data['title'] . ", Status: " . ($auto_publish ? 'published' : 'draft') . ", Content length: " . strlen($clean_content));

$result = make_supabase_request('blog_posts', 'POST', $blog_post);

if ($result) {
    log_message("Blog post saved successfully!");

    // Mark topic as generated
    make_supabase_request(
        'blog_content_queue?id=eq.' . $topic['id'],
        'PATCH',
        [
            'status' => 'generated',
            'generated_at' => date('c')
        ]
    );

    log_message("Status: " . ($auto_publish ? "Published" : "Saved as draft"));
} else {
    log_message("Failed to save blog post");
    make_supabase_request(
        'blog_content_queue?id=eq.' . $topic['id'],
        'PATCH',
        [
            'status' => 'failed',
            'error_message' => 'Failed to save blog post to database'
        ]
    );
}

log_message("=== Cron Job Completed ===\n");

// Return success
echo "Blog post generated successfully: " . $blog_data['title'] . "\n";
exit(0);
?>
