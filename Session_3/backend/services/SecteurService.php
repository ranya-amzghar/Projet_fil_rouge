<?php
declare(strict_types=1);

require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../requests/SecteurRequest.php';

class SecteurService extends BaseService
{
    public function __construct(DAOInterface $dao)
    {
        parent::__construct($dao);
    }

    public function createSecteur(mixed $data): array
    {
        return $this->add($this->validate($data));
    }

    public function updateSecteur(int $id, mixed $data): ?array
    {
        return $this->update($id, $this->validate($data));
    }

    private function validate(mixed $data): array
    {
        $request = new SecteurRequest($data);
        $error = $request->validate();

        if ($error !== null) {
            throw new InvalidArgumentException($error);
        }

        return $request->validated();
    }
}
