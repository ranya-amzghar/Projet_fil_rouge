<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../classes/ApiResponse.php';
require_once __DIR__ . '/../classes/EvenementManager.php';
require_once __DIR__ . '/../classes/EvenementRequest.php';

$manager = new EvenementManager();
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if ($id !== null && $id > 0) {
                $ev = $manager->getById($id);
                if (!$ev) ApiResponse::error('Événement introuvable.', 404);
                ApiResponse::success($ev);
            }
            ApiResponse::success($manager->getAll());
            break;

        case 'POST':
            $input = json_decode((string) file_get_contents('php://input'), true) ?? [];
            $req = new EvenementRequest($input);
            $error = $req->validate();
            if ($error) ApiResponse::error($error, 422);
            $ev = $manager->add($req->validated());
            ApiResponse::success($ev, 201);
            break;

        case 'PUT':
            if (!$id) ApiResponse::error("L'identifiant est requis.", 400);
            $input = json_decode((string) file_get_contents('php://input'), true) ?? [];
            $req = new EvenementRequest($input);
            $error = $req->validate();
            if ($error) ApiResponse::error($error, 422);
            $ev = $manager->update($id, $req->validated());
            if (!$ev) ApiResponse::error('Événement introuvable.', 404);
            ApiResponse::success($ev);
            break;

        case 'DELETE':
            if (!$id) ApiResponse::error("L'identifiant est requis.", 400);
            if (!$manager->delete($id)) ApiResponse::error('Événement introuvable.', 404);
            ApiResponse::success(['id' => $id]);
            break;

        default:
            ApiResponse::error('Méthode non autorisée.', 405);
    }
} catch (Throwable $e) {
    ApiResponse::error('Erreur interne du serveur.', 500);
}
