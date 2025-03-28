<?php
// Set unlimited execution time
set_time_limit(0);
ini_set('max_execution_time', 0);

// Disable output buffering
if (ob_get_level()) {
    ob_end_clean();
}

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, HEAD');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400'); // 24 hours cache

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    exit();
}

// Get video URL from query parameter
$video_url = isset($_GET['url']) ? $_GET['url'] : null;

if (!$video_url) {
    header('HTTP/1.0 400 Bad Request');
    die('Missing video URL parameter');
}

// Validate URL
if (!filter_var($video_url, FILTER_VALIDATE_URL)) {
    header('HTTP/1.0 400 Bad Request');
    die('Invalid URL format');
}

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $video_url);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_NOBODY, true);

// Execute HEAD request to get headers
$response = curl_exec($ch);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$headers = substr($response, 0, $header_size);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$file_size = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);

// Close initial cURL session
curl_close($ch);

// Set response headers
header('Content-Type: ' . $content_type);
header('Content-Length: ' . $file_size);
header('Accept-Ranges: bytes');
header('Cache-Control: public, max-age=31536000');

// Handle range requests (resume downloads and seeking)
if (isset($_SERVER['HTTP_RANGE'])) {
    $ranges = array_map('trim', explode(',', $_SERVER['HTTP_RANGE']));
    $ranges = array_shift($ranges);
    $ranges = explode('-', substr($ranges, 6));
    
    $start = !empty($ranges[0]) ? intval($ranges[0]) : 0;
    $end = !empty($ranges[1]) ? intval($ranges[1]) : ($file_size - 1);
    
    header('HTTP/1.1 206 Partial Content');
    header('Content-Range: bytes ' . $start . '-' . $end . '/' . $file_size);
    header('Content-Length: ' . ($end - $start + 1));
} else {
    $start = 0;
    $end = $file_size - 1;
}

// Initialize streaming cURL session
$ch = curl_init();

// Set streaming cURL options
curl_setopt($ch, CURLOPT_URL, $video_url);
curl_setopt($ch, CURLOPT_RANGE, $start . '-' . $end);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($curl, $data) {
    echo $data;
    return strlen($data);
});

// Execute streaming request
curl_exec($ch);
curl_close($ch); 