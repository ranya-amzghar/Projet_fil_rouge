<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../classes/ApiResponse.php';
require_once __DIR__ . '/../classes/SecteurManager.php';
require_once __DIR__ . '/../classes/SecteurRequest.php';

$manager = new SecteurManager();
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if ($id !== null && $id > 0) {
                $s = $manager->getById($id);
                if (!$s) ApiResponse::error('Secteur introuvable.', 404);
                ApiResponse::success($s);
            }
            ApiResponse::success($manager->getAll());
            break;

        case 'POST':
            $input = json_decode((string) file_get_contents('php://input'), true) ?? [];
            $req = new SecteurRequest($input);
            $error = $req->validate();
            if ($error) ApiResponse::error($error, 422);
            $validated = $req->validated();
            if ($manager->existsByNom($validated['nom'])) ApiResponse::error("Ce secteur existe déjà.", 422);
            $s = $manager->add($validated);
            ApiResponse::success($s, 201);
            break;

        case 'PUT':
            if (!$id) ApiResponse::error("L'identifiant est requis.", 400);
            $input = json_decode((string) file_get_contents('php://input'), true) ?? [];
            $req = new SecteurRequest($input);
            $error = $req->validate();
            if ($error) ApiResponse::error($error, 422);
            $validated = $req->validated();
            if ($manager->existsByNom($validated['nom'], $id)) ApiResponse::error("Ce secteur existe déjà.", 422);
            $s = $manager->update($id, $validated);
            if (!$s) ApiResponse::error('Secteur introuvable.', 404);
            ApiResponse::success($s);
            break;

        case 'DELETE':
            if (!$id) ApiResponse::error("L'identifiant est requis.", 400);
            if (!$manager->delete($id)) ApiResponse::error('Secteur introuvable.', 404);
            ApiResponse::success(['id' => $id]);
            break;

        default:
            ApiResponse::error('Méthode non autorisée.', 405);
    }
} catch (Throwable $e) {
    ApiResponse::error('Erreur interne du serveur.', 500);
}
