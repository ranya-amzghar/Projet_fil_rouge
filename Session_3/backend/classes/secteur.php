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
        $this->nom = $nom;
        $this->icone = $icone;
        $this->couleur = $couleur;
        $this->description = $description;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function getIcone(): string
    {
        return $this->icone;
    }

    public function getCouleur(): string
    {
        return $this->couleur;
    }

    public function getDescription(): string
    {
        return $this->description;
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
}

