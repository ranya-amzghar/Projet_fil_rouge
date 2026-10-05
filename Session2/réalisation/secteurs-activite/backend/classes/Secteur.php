<?php

declare(strict_types=1);

/**
 * Entité représentant un secteur d'activité.
 */
class Secteur
{
    private ?int $id;
    private string $nom;
    private ?string $description;

    public function __construct(?int $id, string $nom, ?string $description = null)
    {
        $this->id = $id;
        $this->nom = trim($nom);
        $this->description = $description !== null ? trim($description) : null;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            (string) ($data['nom'] ?? ''),
            isset($data['description']) ? (string) $data['description'] : null
        );
    }

    public function toArray(): array
    {
        return [
            'id'          => $this->id,
            'nom'         => $this->nom,
            'description' => $this->description,
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    /**
     * Valide les données de l'entité.
     *
     * @return array<string,string> Tableau vide si aucune erreur, sinon messages indexés par champ.
     */
    public function validate(): array
    {
        $errors = [];

        if ($this->nom === '') {
            $errors['nom'] = "Le nom du secteur est obligatoire.";
        } elseif (mb_strlen($this->nom) > 100) {
            $errors['nom'] = 'Le nom ne doit pas dépasser 100 caractères.';
        }

        if ($this->description !== null && mb_strlen($this->description) > 500) {
            $errors['description'] = 'La description ne doit pas dépasser 500 caractères.';
        }

        return $errors;
    }
}
