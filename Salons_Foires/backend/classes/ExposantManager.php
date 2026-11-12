<?php
declare(strict_types=1);

require_once __DIR__ . '/JsonStorage.php';
require_once __DIR__ . '/Exposant.php';

class ExposantManager
{
    private JsonStorage $storage;

    public function __construct()
    {
        $this->storage = new JsonStorage(__DIR__ . '/../database/exposants.json');
    }

    public function getAll(): array { return $this->storage->readAll(); }

    public function getById(int $id): ?array
    {
        foreach ($this->storage->readAll() as $row) {
            if ((int) ($row['id'] ?? 0) === $id) return $row;
        }
        return null;
    }

    public function existsByEmail(string $email, ?int $excludeId = null): bool
    {
        foreach ($this->storage->readAll() as $row) {
            $sameEmail = mb_strtolower((string) ($row['email'] ?? '')) === mb_strtolower($email);
            $other = $excludeId === null || (int) ($row['id'] ?? 0) !== $excludeId;
            if ($sameEmail && $other) return true;
        }
        return false;
    }

    public function add(array $data): array
    {
        $records = $this->storage->readAll();
        $id = $this->storage->nextId($records);
        $exposant = Exposant::fromArray(array_merge($data, ['id' => $id]));
        $record = $exposant->toArray();
        $records[] = $record;
        $this->storage->writeAll($records);
        return $record;
    }

    public function update(int $id, array $data): ?array
    {
        $records = $this->storage->readAll();
        foreach ($records as $i => $row) {
            if ((int) ($row['id'] ?? 0) === $id) {
                $exposant = Exposant::fromArray(array_merge($data, ['id' => $id]));
                $records[$i] = $exposant->toArray();
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
}
