<?php
/**
 * PHP API Endpoint for Quote Submission
 * For use with Apache hosting
 * 
 * Requirements:
 * - PHP 7.4 or higher
 * - mail() function enabled or SMTP configured
 */

// Set headers for CORS and JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
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

// Configuration
define('NOTIFICATION_EMAIL', 'your-email@example.com'); // Change this!
define('FROM_EMAIL', 'noreply@yoursite.com'); // Change this!
define('MAX_SUBMISSIONS_PER_HOUR', 3);
define('SUBMISSIONS_LOG_FILE', __DIR__ . '/../../data/submissions.json');
define('RATE_LIMIT_FILE', __DIR__ . '/../../data/rate_limit.json');

// Create data directory if it doesn't exist
$dataDir = dirname(SUBMISSIONS_LOG_FILE);
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ip = $_SERVER['REMOTE_ADDR'];
    
    // Check for proxy headers
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }
    
    return $ip;
}

/**
 * Check rate limiting
 */
function checkRateLimit($ip) {
    if (!file_exists(RATE_LIMIT_FILE)) {
        file_put_contents(RATE_LIMIT_FILE, json_encode([]));
    }
    
    $rateLimits = json_decode(file_get_contents(RATE_LIMIT_FILE), true);
    $now = time();
    $oneHourAgo = $now - 3600;
    
    // Clean old entries
    $rateLimits = array_filter($rateLimits, function($entry) use ($oneHourAgo) {
        return $entry['timestamp'] > $oneHourAgo;
    });
    
    // Count submissions from this IP
    $ipSubmissions = array_filter($rateLimits, function($entry) use ($ip) {
        return $entry['ip'] === $ip;
    });
    
    if (count($ipSubmissions) >= MAX_SUBMISSIONS_PER_HOUR) {
        return [
            'allowed' => false,
            'retryAfter' => ceil((min(array_column($ipSubmissions, 'timestamp')) + 3600 - $now) / 60)
        ];
    }
    
    // Add current submission
    $rateLimits[] = [
        'ip' => $ip,
        'timestamp' => $now
    ];
    
    file_put_contents(RATE_LIMIT_FILE, json_encode($rateLimits));
    
    return ['allowed' => true];
}

/**
 * Detect spam
 */
function detectSpam($contact) {
    $suspiciousPatterns = [
        '/viagra|cialis|casino|lottery|winner/i',
        '/\b(http|https):\/\//i',
        '/(.)\1{10,}/'
    ];
    
    $textToCheck = $contact['name'] . ' ' . $contact['email'] . ' ' . $contact['location'];
    
    foreach ($suspiciousPatterns as $pattern) {
        if (preg_match($pattern, $textToCheck)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Validate submission data
 */
function validateSubmission($data) {
    $required = ['ramSpec', 'contact', 'quote', 'submissionId', 'timestamp'];
    
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            return false;
        }
    }
    
    // Validate RAM spec
    $ramSpec = $data['ramSpec'];
    if (!isset($ramSpec['type']) || !isset($ramSpec['capacity']) || 
        !isset($ramSpec['speed']) || !isset($ramSpec['brand'])) {
        return false;
    }
    
    // Validate contact
    $contact = $data['contact'];
    if (!isset($contact['name']) || !isset($contact['email']) || 
        !isset($contact['phone'])) {
        return false;
    }
    
    // Validate email format
    if (!filter_var($contact['email'], FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    
    return true;
}

/**
 * Store submission
 */
function storeSubmission($submission) {
    $submissions = [];
    
    if (file_exists(SUBMISSIONS_LOG_FILE)) {
        $submissions = json_decode(file_get_contents(SUBMISSIONS_LOG_FILE), true);
    }
    
    $submissions[] = $submission;
    
    // Keep only last 100 submissions
    if (count($submissions) > 100) {
        $submissions = array_slice($submissions, -100);
    }
    
    file_put_contents(SUBMISSIONS_LOG_FILE, json_encode($submissions, JSON_PRETTY_PRINT));
}

/**
 * Send email notification
 */
function sendEmailNotification($submission) {
    $ramSpec = $submission['ramSpec'];
    $contact = $submission['contact'];
    $quote = $submission['quote'];
    
    $subject = "New RAM Quote Request - " . $submission['submissionId'];
    
    $message = "New RAM Quote Request\n\n";
    $message .= "Submission ID: " . $submission['submissionId'] . "\n";
    $message .= "Timestamp: " . $submission['timestamp'] . "\n\n";
    
    $message .= "RAM Specifications:\n";
    $message .= "- Type: " . $ramSpec['type'] . "\n";
    $message .= "- Capacity: " . $ramSpec['capacity'] . " GB\n";
    $message .= "- Speed: " . $ramSpec['speed'] . " MHz\n";
    $message .= "- Brand: " . $ramSpec['brand'] . "\n";
    $message .= "- Condition: " . $ramSpec['condition'] . "\n";
    $message .= "- Quantity: " . $ramSpec['quantity'] . "\n\n";
    
    $message .= "Quote Details:\n";
    $message .= "- Estimated Value: $" . number_format($quote['estimatedValue'], 2) . "\n";
    $message .= "- Price Range: $" . number_format($quote['priceRange']['min'], 2) . 
                " - $" . number_format($quote['priceRange']['max'], 2) . "\n";
    $message .= "- Timeline: " . $quote['timeline'] . "\n\n";
    
    $message .= "Contact Information:\n";
    $message .= "- Name: " . $contact['name'] . "\n";
    $message .= "- Email: " . $contact['email'] . "\n";
    $message .= "- Phone: " . $contact['phone'] . "\n";
    $message .= "- Preferred Contact: " . $contact['preferredContact'] . "\n";
    $message .= "- Location: " . $contact['location'] . "\n";
    
    $headers = "From: " . FROM_EMAIL . "\r\n";
    $headers .= "Reply-To: " . $contact['email'] . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    return mail(NOTIFICATION_EMAIL, $subject, $message, $headers);
}

// Main execution
try {
    // Get and decode JSON input
    $input = file_get_contents('php://input');
    $submission = json_decode($input, true);
    
    if (!$submission) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit();
    }
    
    // Validate submission
    if (!validateSubmission($submission)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid submission data']);
        exit();
    }
    
    // Check rate limiting
    $clientIP = getClientIP();
    $rateLimitCheck = checkRateLimit($clientIP);
    
    if (!$rateLimitCheck['allowed']) {
        http_response_code(429);
        echo json_encode([
            'error' => 'Too many submissions',
            'message' => "Please try again in {$rateLimitCheck['retryAfter']} minutes",
            'retryAfter' => $rateLimitCheck['retryAfter']
        ]);
        exit();
    }
    
    // Check for spam
    if (detectSpam($submission['contact'])) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Spam detected',
            'message' => 'Your submission was flagged as suspicious'
        ]);
        exit();
    }
    
    // Store submission
    storeSubmission($submission);
    
    // Send email notification
    $emailSent = sendEmailNotification($submission);
    
    if (!$emailSent) {
        error_log("Failed to send email notification for submission: " . $submission['submissionId']);
    }
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Quote request submitted successfully',
        'submissionId' => $submission['submissionId']
    ]);
    
} catch (Exception $e) {
    error_log("Submission error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => 'An error occurred while processing your request'
    ]);
}
?>
