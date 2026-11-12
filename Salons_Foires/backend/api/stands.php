<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../classes/ApiResponse.php';
require_once __DIR__ . '/../classes/StandManager.php';
require_once __DIR__ . '/../classes/StandRequest.php';

$manager = new StandManager();
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$evenementId = isset($_GET['evenement_id']) ? (int) $_GET['evenement_id'] : null;
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if ($id !== null && $id > 0) {
                $stand = $manager->getById($id);
                if (!$stand) ApiResponse::error('Stand introuvable.', 404);
                ApiResponse::success($stand);
            }
            if ($evenementId !== null && $evenementId > 0) {
                ApiResponse::success($manager->getByEvenement($evenementId));
            }
            ApiResponse::success($manager->getAll());
            break;

        case 'POST':
            $input = json_decode((string) file_get_contents('php://input'), true) ?? [];
            $req = new StandRequest($input);
            $error = $req->validate();
            if ($error) ApiResponse::error($error, 422);
            $stand = $manager->add($req->validated());
            ApiResponse::success($stand, 201);
            break;

        case 'PUT':
            if (!$id) ApiResponse::error("L'identifiant est requis.", 400);
            $input = json_decode((string) file_get_contents('php://input'), true) ?? [];
            $req = new StandRequest($input);
            $error = $req->validate();
            if ($error) ApiResponse::error($error, 422);
            $stand = $manager->update($id, $req->validated());
            if (!$stand) ApiResponse::error('Stand introuvable.', 404);
            ApiResponse::success($stand);
            break;

        case 'DELETE':
            if (!$id) ApiResponse::error("L'identifiant est requis.", 400);
            if (!$manager->delete($id)) ApiResponse::error('Stand introuvable.', 404);
            ApiResponse::success(['id' => $id]);
            break;

        default:
            ApiResponse::error('Méthode non autorisée.', 405);
    }
} catch (Throwable $e) {
    ApiResponse::error('Erreur interne du serveur.', 500);
}
