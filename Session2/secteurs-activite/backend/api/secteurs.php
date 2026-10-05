<?php

declare(strict_types=1);

require_once __DIR__ . '/../classes/JsonStorage.php';
require_once __DIR__ . '/../classes/Secteur.php';
require_once __DIR__ . '/../classes/SecteurRepository.php';
require_once __DIR__ . '/../classes/ApiResponse.php';

header('Content-Type: application/json; charset=utf-8');

// CORS : autorise le frontend statique (HTML/JS) à appeler l'API depuis une autre origine/port en développement.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$repository = new SecteurRepository(new JsonStorage(__DIR__ . '/../database/secteurs.json'));

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if ($id !== null) {
                $secteur = $repository->find($id);
                if ($secteur === null) {
                    ApiResponse::error('Secteur introuvable.', 404);
                }
                ApiResponse::success($secteur->toArray());
            }

            $secteurs = array_map(
                static fn(Secteur $s): array => $s->toArray(),
                $repository->findAll()
            );
            ApiResponse::success($secteurs);
            break;

        case 'POST':
            $input = read_json_body();

            $secteur = Secteur::fromArray(['nom' => $input['nom'] ?? '', 'description' => $input['description'] ?? null]);
            $errors  = $secteur->validate();

            if ($errors === [] && $repository->existsByNom($secteur->getNom())) {
                $errors['nom'] = 'Ce secteur existe déjà.';
            }
            if ($errors) {
                ApiResponse::error('Données invalides.', 422, $errors);
            }

            $created = $repository->create($secteur);
            ApiResponse::success($created->toArray(), 201);
            break;

        case 'PUT':
            if ($id === null) {
                ApiResponse::error("L'identifiant du secteur est requis.", 400);
            }

            $input = read_json_body();

            $secteur = Secteur::fromArray(['nom' => $input['nom'] ?? '', 'description' => $input['description'] ?? null]);
            $errors  = $secteur->validate();

            if ($errors === [] && $repository->existsByNom($secteur->getNom(), $id)) {
                $errors['nom'] = 'Ce secteur existe déjà.';
            }
            if ($errors) {
                ApiResponse::error('Données invalides.', 422, $errors);
            }

            $updated = $repository->update($id, $secteur);
            if ($updated === null) {
                ApiResponse::error('Secteur introuvable.', 404);
            }

            ApiResponse::success($updated->toArray());
            break;

        case 'DELETE':
            if ($id === null) {
                ApiResponse::error("L'identifiant du secteur est requis.", 400);
            }

            if (!$repository->delete($id)) {
                ApiResponse::error('Secteur introuvable.', 404);
            }

            ApiResponse::success(['id' => $id]);
            break;

        default:
            ApiResponse::error('Méthode non autorisée.', 405);
    }
} catch (Throwable $e) {
    ApiResponse::error('Erreur interne du serveur.', 500);
}

/** Décode le corps JSON de la requête (POST/PUT). */
function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode((string) $raw, true);

    return is_array($data) ? $data : [];
}
