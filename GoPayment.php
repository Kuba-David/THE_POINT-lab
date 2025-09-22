<?php
// Set headers
header('Content-Type: application/json');

// --- CONFIGURATION ---
// IMPORTANT: Replace with your actual GoPay credentials from environment variables or a secure config file
$goid = 'YOUR_GOID';
$clientId = 'YOUR_CLIENT_ID';
$clientSecret = 'YOUR_CLIENT_SECRET';
$isProduction = false; // Set to true for production environment

// --- API URLs ---
$apiUrl = $isProduction ? 'https://gate.gopay.cz/api' : 'https://gw.sandbox.gopay.com/api';

// --- HELPER FUNCTION FOR cURL ---
function callGopayAPI($url, $method = 'POST', $token = null, $data = null) {
    $ch = curl_init($url);
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
    ];

    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'response' => json_decode($response, true)];
}


// --- 1. GET OAUTH2 ACCESS TOKEN ---
$authData = 'grant_type=client_credentials&scope=payment-create';
$authUrl = $apiUrl . '/oauth2/token';

$ch = curl_init($authUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $authData);
curl_setopt($ch, CURLOPT_USERPWD, $clientId . ':' . $clientSecret);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/x-www-form-urlencoded',
]);

$authResult = curl_exec($ch);
$authHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$authResponse = json_decode($authResult, true);

if ($authHttpCode !== 200 || !isset($authResponse['access_token'])) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to get auth token.']);
    exit;
}

$accessToken = $authResponse['access_token'];

// --- 2. CREATE PAYMENT ---
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input data.']);
    exit;
}

// Calculate total amount
$totalAmount = 0;
$items = [];
foreach($data['cart'] as $item) {
    $totalAmount += $item['price'] * $item['quantity'];
    $items[] = [
        'name' => $item['name'] . ' (' . $item['color'] . '/' . $item['size'] . ')',
        'amount' => (int)($item['price'] * 100), // in cents
        'count' => $item['quantity'],
    ];
}
$totalAmount += $data['shipping']['price'];
$items[] = [
    'name' => 'Shipping: ' . $data['shipping']['name'],
    'amount' => (int)($data['shipping']['price'] * 100),
    'count' => 1,
];


// Get base URL of your site
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
$path = dirname($_SERVER['REQUEST_URI']);
$returnUrl = $baseUrl . str_replace('/php', '', $path) . '/thank_you.html';
$callbackUrl = $baseUrl . $path . '/payment_callback.php';


$paymentData = [
    'payer' => [
        'contact' => [
            'first_name' => explode(' ', $data['customer']['name'])[0] ?? '',
            'last_name' => implode(' ', array_slice(explode(' ', $data['customer']['name']), 1)) ?: '',
            'email' => $data['customer']['email'],
            'phone_number' => $data['customer']['phone'],
            'city' => $data['customer']['city'],
            'street' => $data['customer']['address'],
            'postal_code' => $data['customer']['zip'],
            'country_code' => 'CZE', // Needs logic to convert country name to ISO 3166-1 alpha-3 code
        ],
    ],
    'target' => [
        'type' => 'ACCOUNT',
        'goid' => $goid,
    ],
    'amount' => (int)($totalAmount * 100), // Amount in cents
    'currency' => 'EUR',
    'order_number' => 'ORDER-' . time(), // Generate a unique order number
    'order_description' => 'Purchase at The Point',
    'items' => $items,
    'callback' => [
        'return_url' => $returnUrl,
        'notification_url' => $callbackUrl,
    ],
    'lang' => 'EN',
];

$paymentResult = callGopayAPI($apiUrl . '/payments/payment', 'POST', $accessToken, $paymentData);

if ($paymentResult['code'] === 200 && isset($paymentResult['response']['gw_url'])) {
    echo json_encode([
        'status' => 'success',
        'gatewayUrl' => $paymentResult['response']['gw_url']
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to create payment.',
        'details' => $paymentResult['response']
    ]);
}
?>

