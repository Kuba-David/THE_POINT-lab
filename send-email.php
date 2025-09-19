<?php

// Nastavíme hlavičku, že odpověď bude ve formátu JSON
header('Content-Type: application/json');

// --- Funkce pro odeslání odpovědi ---
function send_json_response($status, $message) {
    echo json_encode(['status' => $status, 'message' => $message]);
    exit;
}

// ------ NASTAVENÍ ------
$prijemce_emailu = "info@thepoint-lab.eu"; // TVŮJ E-MAIL ZDE
// -----------------------

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_json_response('error', 'Invalid request method.');
}

// Honeypot spam ochrana
if (!empty($_POST['honeypot'])) {
    send_json_response('success', 'Thank you for your submission.'); // Pro bota se tváříme, že vše proběhlo OK
}

// Získání a ošetření dat
$jmeno = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$zprava = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validace dat
if (empty($jmeno) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($zprava)) {
    send_json_response('error', 'Please fill in all the fields correctly.');
}

// Sestavení e-mailu
$predmet = "Nová zpráva z webu The Point od: $jmeno";
$obsah_emailu = "Jméno: $jmeno\nE-mail: $email\n\nZpráva:\n$zprava";
$hlavicky = "From: The Point <noreply@" . $_SERVER['SERVER_NAME'] . ">\r\n" .
            "Reply-To: $jmeno <$email>\r\n" .
            "Content-Type: text/plain; charset=UTF-8\r\n" .
            "X-Mailer: PHP/" . phpversion();

// Odeslání e-mailu
if (mail($prijemce_emailu, $predmet, $obsah_emailu, $hlavicky)) {
    send_json_response('success', 'Message sent successfully!');
} else {
    // Pokud selže funkce mail()
    send_json_response('error', 'Server could not send the email. Please try again later.');
}

?>
