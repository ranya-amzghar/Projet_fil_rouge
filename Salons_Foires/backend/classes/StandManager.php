<?php
declare(strict_types=1);

require_once __DIR__ . '/JsonStorage.php';
require_once __DIR__ . '/Stand.php';

class StandManager
{
    private JsonStorage $storage;

    public function __construct()
    {
        $this->storage = new JsonStorage(__DIR__ . '/../database/stands.json');
    }

    public function getAll(): array { return $this->storage->readAll(); }

    public function getByEvenement(int $evenementId): array
    {
        return array_values(array_filter($this->storage->readAll(), fn($r) => (int)($r['evenement_id'] ?? 0) === $evenementId));
    }

    public function getById(int $id): ?array
    {
        foreach ($this->storage->readAll() as $row) {
            if ((int) ($row['id'] ?? 0) === $id) return $row;
        }
        return null;
    }

    public function add(array $data): array
    {
        $records = $this->storage->readAll();
        $id = $this->storage->nextId($records);
        $stand = Stand::fromArray(array_merge($data, ['id' => $id]));
        $record = $stand->toArray();
        $records[] = $record;
        $this->storage->writeAll($records);
        return $record;
    }

    public function update(int $id, array $data): ?array
    {
        $records = $this->storage->readAll();
        foreach ($records as $i => $row) {
            if ((int) ($row['id'] ?? 0) === $id) {
                $stand = Stand::fromArray(array_merge($data, ['id' => $id]));
                $records[$i] = $stand->toArray();
                $this->storage->writeAll($records);
                return $records[$i];
            }
        }
        return null;
    }

    public function delete(int $id): bool
    {
        $records = $this->storage->readAll();
        $filtered = array_values(array_filter($records, fn($r) => (int) ($r['id'] ?? 0) !== $id));
        if (count($filtered) === count($records)) return false;
        $this->storage->writeAll($filtered);
        return true;
    }

    public function deleteByEvenement(int $evenementId): void
    {
        $records = array_values(array_filter($this->storage->readAll(), fn($r) => (int)($r['evenement_id'] ?? 0) !== $evenementId));
        $this->storage->writeAll($records);
    }
}
