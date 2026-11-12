<?php
declare(strict_types=1);

class Evenement
{
    private ?int $id;
    private string $titre;
    private string $type;
    private string $description;
    private string $date_debut;
    private string $date_fin;
    private string $lieu;
    private string $ville;
    private string $statut;

    public function __construct(
        ?int $id,
        string $titre,
        string $type,
        string $description,
        string $date_debut,
        string $date_fin,
        string $lieu,
        string $ville,
        string $statut
    ) {
        $this->id = $id;
        $this->titre = trim($titre);
        $this->type = $type;
        $this->description = trim($description);
        $this->date_debut = $date_debut;
        $this->date_fin = $date_fin;
        $this->lieu = trim($lieu);
        $this->ville = trim($ville);
        $this->statut = $statut;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            (string) ($data['titre'] ?? ''),
            (string) ($data['type'] ?? 'salon'),
            (string) ($data['description'] ?? ''),
            (string) ($data['date_debut'] ?? ''),
            (string) ($data['date_fin'] ?? ''),
            (string) ($data['lieu'] ?? ''),
            (string) ($data['ville'] ?? ''),
            (string) ($data['statut'] ?? 'planifie')
        );
    }

    public function toArray(): array
    {
        return [
            'id'          => $this->id,
            'titre'       => $this->titre,
            'type'        => $this->type,
            'description' => $this->description,
            'date_debut'  => $this->date_debut,
            'date_fin'    => $this->date_fin,
            'lieu'        => $this->lieu,
            'ville'       => $this->ville,
            'statut'      => $this->statut,
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(int $id): void { $this->id = $id; }
    public function getTitre(): string { return $this->titre; }
    public function getType(): string { return $this->type; }
    public function getStatut(): string { return $this->statut; }
}
