<?php
declare(strict_types=1);

interface DAOInterface
{
    public function getAll(): array;

    public function getById(int $id): ?array;

    public function add(array $data): array;

    public function update(int $id, array $data): ?array;

    public function delete(int $id): bool;
}
