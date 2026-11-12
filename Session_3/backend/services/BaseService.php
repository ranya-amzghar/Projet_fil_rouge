<?php
declare(strict_types=1);

require_once __DIR__ . '/../dao/DAOInterface.php';

abstract class BaseService
{
    protected DAOInterface $dao;

    public function __construct(DAOInterface $dao)
    {
        $this->dao = $dao;
    }

    public function getAll(): array
    {
        return $this->dao->getAll();
    }

    public function getById(int $id): ?array
    {
        return $this->dao->getById($id);
    }

    public function add(array $data): array
    {
        return $this->dao->add($data);
    }

    public function update(int $id, array $data): ?array
    {
        return $this->dao->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->dao->delete($id);
    }
}
