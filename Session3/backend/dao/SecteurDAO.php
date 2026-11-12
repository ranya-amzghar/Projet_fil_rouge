<?php
declare(strict_types=1);

require_once __DIR__ . '/DAOInterface.php';
require_once __DIR__ . '/../classes/secteur.php';

class SecteurDAO implements DAOInterface
{
    private string $file;

    public function __construct()
    {
        $this->file = __DIR__ . '/../database/secteur_data.json';
        $directory = dirname($this->file);

        if (!is_dir($directory) && !mkdir($directory, 0777, true) && !is_dir($directory)) {
            throw new RuntimeException('Impossible de créer le répertoire de stockage.');
        }

        if (!file_exists($this->file) && file_put_contents($this->file, '[]', LOCK_EX) === false) {
            throw new RuntimeException('Impossible de créer le fichier de stockage.');
        }
    }

    private function read(): array
    {
        if (!file_exists($this->file)) {
            return [];
        }

        $raw = file_get_contents($this->file);
        if ($raw === false) {
            throw new RuntimeException('Impossible de lire le fichier de stockage.');
        }

        $data = json_decode($raw, true);

        return is_array($data) ? $data : [];
    }

    private function write(array $secteurs): void
    {
        $json = json_encode(
            array_values($secteurs),
            JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR
        );

        if (file_put_contents($this->file, $json, LOCK_EX) === false) {
            throw new RuntimeException("Impossible d'ecrire dans le fichier de stockage.");
        }
    }

    private function nextId(array $secteurs): int
    {
        $max = 0;
        foreach ($secteurs as $secteur) {
            if (isset($secteur['id']) && (int) $secteur['id'] > $max) {
                $max = (int) $secteur['id'];
            }
        }

        return $max + 1;
    }

    public function getAll(): array
    {
        return $this->read();
    }

    public function getById(int $id): ?array
    {
        foreach ($this->read() as $secteur) {
            if ((int) ($secteur['id'] ?? 0) === $id) {
                return $secteur;
            }
        }

        return null;
    }

    public function add(array $data): array
    {
        $secteurs = $this->read();
        $secteur = new Secteur(
            $this->nextId($secteurs),
            $data['nom'],
            $data['icone'],
            $data['couleur'],
            $data['description']
        );
        $record = $secteur->toArray();
        $secteurs[] = $record;
        $this->write($secteurs);

        return $record;
    }

    public function update(int $id, array $data): ?array
    {
        $secteurs = $this->read();
        foreach ($secteurs as $index => $storedSecteur) {
            if ((int) ($storedSecteur['id'] ?? 0) !== $id) {
                continue;
            }

            $secteur = new Secteur(
                $id,
                $data['nom'],
                $data['icone'],
                $data['couleur'],
                $data['description']
            );
            $record = $secteur->toArray();
            $secteurs[$index] = $record;
            $this->write($secteurs);

            return $record;
        }

        return null;
    }

    public function delete(int $id): bool
    {
        $secteurs = $this->read();
        foreach ($secteurs as $index => $secteur) {
            if ((int) ($secteur['id'] ?? 0) !== $id) {
                continue;
            }

            unset($secteurs[$index]);
            $this->write($secteurs);

            return true;
        }

        return false;
    }
}
