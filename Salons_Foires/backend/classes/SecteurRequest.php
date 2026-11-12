<?php
declare(strict_types=1);

class SecteurRequest
{
    private array $data;

    public function __construct(mixed $data)
    {
        $this->data = is_array($data) ? $data : [];
    }

    public function validate(): ?string
    {
        if (empty($this->data)) return 'Données invalides ou corps de requête vide.';

        foreach (['nom', 'icone', 'couleur', 'description'] as $field) {
            if (!isset($this->data[$field]) || trim((string) $this->data[$field]) === '') {
                return "Le champ '$field' est obligatoire.";
            }
        }

        if (mb_strlen(trim((string) $this->data['nom'])) > 100) return 'Le nom du secteur ne doit pas dépasser 100 caractères.';
        if (!preg_match('/^#[0-9a-fA-F]{6}$/', (string) $this->data['couleur'])) return 'La couleur doit être au format hexadécimal (#RRGGBB).';
        if (mb_strlen(trim((string) $this->data['description'])) > 1000) return 'La description ne doit pas dépasser 1000 caractères.';

        return null;
    }

    public function validated(): array
    {
        return [
            'nom'         => trim((string) ($this->data['nom'] ?? '')),
            'icone'       => trim((string) ($this->data['icone'] ?? '')),
            'couleur'     => trim((string) ($this->data['couleur'] ?? '')),
            'description' => trim((string) ($this->data['description'] ?? '')),
        ];
    }
}
