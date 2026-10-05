<?php

declare(strict_types=1);

require_once __DIR__ . '/JsonStorage.php';
require_once __DIR__ . '/Secteur.php';

/**
 * Accès aux secteurs d'activité stockés dans le fichier JSON.
 * Fait le lien entre l'entité Secteur et la couche de stockage générique JsonStorage.
 */
class SecteurRepository
{
    private JsonStorage $storage;

    public function __construct(JsonStorage $storage)
    {
        $this->storage = $storage;
    }

    /** @return Secteur[] */
    public function findAll(): array
    {
        return array_map(
            static fn(array $row): Secteur => Secteur::fromArray($row),
            $this->storage->readAll()
        );
    }

    public function find(int $id): ?Secteur
    {
        foreach ($this->storage->readAll() as $row) {
            if ((int) ($row['id'] ?? 0) === $id) {
                return Secteur::fromArray($row);
            }
        }

        return null;
    }

    public function existsByNom(string $nom, ?int $excludeId = null): bool
    {
        foreach ($this->storage->readAll() as $row) {
            $sameNom    = mb_strtolower((string) ($row['nom'] ?? '')) === mb_strtolower($nom);
            $otherEntry = $excludeId === null || (int) ($row['id'] ?? 0) !== $excludeId;

            if ($sameNom && $otherEntry) {
                return true;
            }
        }

        return false;
    }

    public function create(Secteur $secteur): Secteur
    {
        $records = $this->storage->readAll();
        $secteur->setId($this->storage->nextId($records));

        $records[] = $secteur->toArray();
        $this->storage->writeAll($records);

        return $secteur;
    }

    public function update(int $id, Secteur $secteur): ?Secteur
    {
        $records = $this->storage->readAll();
        $found   = false;

        foreach ($records as $index => $row) {
            if ((int) ($row['id'] ?? 0) === $id) {
                $secteur->setId($id);
                $records[$index] = $secteur->toArray();
                $found = true;
                break;
            }
        }

        if (!$found) {
            return null;
        }

        $this->storage->writeAll($records);

        return $secteur;
    }

    public function delete(int $id): bool
    {
        $records = $this->storage->readAll();
        $filtered = array_values(array_filter(
            $records,
            static fn(array $row): bool => (int) ($row['id'] ?? 0) !== $id
        ));

        if (count($filtered) === count($records)) {
            return false;
        }

        $this->storage->writeAll($filtered);

        return true;
    }
}
