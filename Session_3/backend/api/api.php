<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../controllers/controller.php';
require_once __DIR__ . '/../dao/SecteurDAO.php';
require_once __DIR__ . '/../services/SecteurService.php';

$method     = $_SERVER['REQUEST_METHOD'];
$id         = isset($_GET['id']) ? (int) $_GET['id'] : null;

try {
    $controller = new SecteurController(new SecteurService(new SecteurDAO()));
    $rawInput = file_get_contents('php://input');
    $data     = json_decode((string) $rawInput, true);

    switch ($method) {
        case 'GET':
            if ($id !== null && $id > 0) {
                $controller->gettingSecteur($id);
            } else {
                $controller->gettingSecteurs();
            }
            break;

        case 'POST':
            $controller->addingSecteur($data);
            break;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['message' => 'Identifiant manquant.'], JSON_UNESCAPED_UNICODE);
                break;
            }
            $controller->updatingSecteur($id, $data);
            break;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['message' => 'Identifiant manquant.'], JSON_UNESCAPED_UNICODE);
                break;
            }
            $controller->deletingSecteur($id);
            break;

        default:
            http_response_code(405);
            echo json_encode(['message' => 'Méthode non autorisée.'], JSON_UNESCAPED_UNICODE);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur.'], JSON_UNESCAPED_UNICODE);
}
