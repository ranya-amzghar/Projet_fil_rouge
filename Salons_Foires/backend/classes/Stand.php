<?php
declare(strict_types=1);

class Stand
{
    private ?int $id;
    private string $numero;
    private ?float $superficie;
    private ?float $prix;
    private string $statut;
    private int $evenement_id;
    private ?int $exposant_id;

    public function __construct(?int $id, string $numero, ?float $superficie, ?float $prix, string $statut, int $evenement_id, ?int $exposant_id)
    {
        $this->id = $id;
        $this->numero = trim($numero);
        $this->superficie = $superficie;
        $this->prix = $prix;
        $this->statut = $statut;
        $this->evenement_id = $evenement_id;
        $this->exposant_id = $exposant_id;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            (string) ($data['numero'] ?? ''),
            isset($data['superficie']) && $data['superficie'] !== '' && $data['superficie'] !== null ? (float) $data['superficie'] : null,
            isset($data['prix']) && $data['prix'] !== '' && $data['prix'] !== null ? (float) $data['prix'] : null,
            (string) ($data['statut'] ?? 'disponible'),
            (int) ($data['evenement_id'] ?? 0),
            isset($data['exposant_id']) && $data['exposant_id'] !== '' && $data['exposant_id'] !== null ? (int) $data['exposant_id'] : null
        );
    }

    public function toArray(): array
    {
        return [
            'id'           => $this->id,
            'numero'       => $this->numero,
            'superficie'   => $this->superficie,
            'prix'         => $this->prix,
            'statut'       => $this->statut,
            'evenement_id' => $this->evenement_id,
            'exposant_id'  => $this->exposant_id,
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(int $id): void { $this->id = $id; }
    public function getNumero(): string { return $this->numero; }
    public function getEvenementId(): int { return $this->evenement_id; }
}
