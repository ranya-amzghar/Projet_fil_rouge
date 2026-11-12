<?php
declare(strict_types=1);

class Secteur
{
    private ?int $id;
    private string $nom;
    private string $icone;
    private string $couleur;
    private string $description;

    public function __construct(?int $id, string $nom, string $icone, string $couleur, string $description)
    {
        $this->id = $id;
        $this->nom = trim($nom);
        $this->icone = trim($icone);
        $this->couleur = trim($couleur);
        $this->description = trim($description);
    }

    public static function fromArray(array $data): self
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            (string) ($data['nom'] ?? ''),
            (string) ($data['icone'] ?? ''),
            (string) ($data['couleur'] ?? '#4f46e5'),
            (string) ($data['description'] ?? '')
        );
    }

    public function toArray(): array
    {
        return [
            'id'          => $this->id,
            'nom'         => $this->nom,
            'icone'       => $this->icone,
            'couleur'     => $this->couleur,
            'description' => $this->description,
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(int $id): void { $this->id = $id; }
    public function getNom(): string { return $this->nom; }
}
