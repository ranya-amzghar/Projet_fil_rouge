<?php
declare(strict_types=1);

require_once __DIR__ . '/../services/SecteurService.php';

class SecteurController
{
    private SecteurService $service;

    public function __construct(SecteurService $service)
    {
        $this->service = $service;
    }

    private function respond(mixed $data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    public function gettingSecteurs(): void
    {
        $this->respond($this->service->getAll());
    }

    public function gettingSecteur(int $id): void
    {
        $secteur = $this->service->getById($id);
        if ($secteur === null) {
            $this->respond(['message' => 'Secteur introuvable.'], 404);
            return;
        }

        $this->respond($secteur);
    }

    public function addingSecteur(mixed $data): void
    {
        try {
            $secteur = $this->service->createSecteur($data);
        } catch (InvalidArgumentException $exception) {
            $this->respond(['message' => $exception->getMessage()], 400);
            return;
        }

        $this->respond([
            'message' => "Secteur d'activité ajouté avec succès",
            'secteur' => $secteur,
        ], 201);
    }

    public function updatingSecteur(int $id, mixed $data): void
    {
        try {
            $secteur = $this->service->updateSecteur($id, $data);
        } catch (InvalidArgumentException $exception) {
            $this->respond(['message' => $exception->getMessage()], 400);
            return;
        }

        if ($secteur === null) {
            $this->respond(['message' => 'Secteur introuvable.'], 404);
            return;
        }

        $this->respond([
            'message' => "Secteur d'activité modifié avec succès",
            'secteur' => $secteur,
        ]);
    }

    public function deletingSecteur(int $id): void
    {
        if (!$this->service->delete($id)) {
            $this->respond(['message' => 'Secteur introuvable.'], 404);
            return;
        }

        $this->respond(['message' => "Secteur d'activité supprimé avec succès"]);
    }
}
