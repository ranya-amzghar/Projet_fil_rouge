<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../classes/ApiResponse.php';
require_once __DIR__ . '/../classes/ExposantManager.php';
require_once __DIR__ . '/../classes/ExposantRequest.php';

$manager = new ExposantManager();
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if ($id !== null && $id > 0) {
                $exp = $manager->getById($id);
                if (!$exp) ApiResponse::error('Exposant introuvable.', 404);
                ApiResponse::success($exp);
            }
            ApiResponse::success($manager->getAll());
            break;

        case 'POST':
            $input = json_decode((string) file_get_contents('php://input'), true) ?? [];
            $req = new ExposantRequest($input);
            $error = $req->validate();
            if ($error) ApiResponse::error($error, 422);
            $validated = $req->validated();
            if ($manager->existsByEmail($validated['email'])) ApiResponse::error("Cet email est déjà utilisé.", 422);
            $exp = $manager->add($validated);
            ApiResponse::success($exp, 201);
            break;

        case 'PUT':
            if (!$id) ApiResponse::error("L'identifiant est requis.", 400);
            $input = json_decode((string) file_get_contents('php://input'), true) ?? [];
            $req = new ExposantRequest($input);
            $error = $req->validate();
            if ($error) ApiResponse::error($error, 422);
            $validated = $req->validated();
            if ($manager->existsByEmail($validated['email'], $id)) ApiResponse::error("Cet email est déjà utilisé.", 422);
            $exp = $manager->update($id, $validated);
            if (!$exp) ApiResponse::error('Exposant introuvable.', 404);
            ApiResponse::success($exp);
            break;

        case 'DELETE':
            if (!$id) ApiResponse::error("L'identifiant est requis.", 400);
            if (!$manager->delete($id)) ApiResponse::error('Exposant introuvable.', 404);
            ApiResponse::success(['id' => $id]);
            break;

        default:
            ApiResponse::error('Méthode non autorisée.', 405);
    }
} catch (Throwable $e) {
    ApiResponse::error('Erreur interne du serveur.', 500);
}
