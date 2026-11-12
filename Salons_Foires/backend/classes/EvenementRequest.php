<?php
declare(strict_types=1);

class EvenementRequest
{
    private array $data;

    public function __construct(mixed $data)
    {
        $this->data = is_array($data) ? $data : [];
    }

    public function validate(): ?string
    {
        if (empty($this->data)) return 'Données invalides ou corps de requête vide.';

        $titre = trim((string) ($this->data['titre'] ?? ''));
        if ($titre === '') return "Le champ 'titre' est obligatoire.";
        if (mb_strlen($titre) > 150) return 'Le titre ne doit pas dépasser 150 caractères.';

        $type = (string) ($this->data['type'] ?? '');
        if (!in_array($type, ['salon', 'foire'], true)) return "Le type doit être 'salon' ou 'foire'.";

        $debut = (string) ($this->data['date_debut'] ?? '');
        $fin = (string) ($this->data['date_fin'] ?? '');
        if (!$this->isDate($debut)) return 'La date de début est invalide.';
        if (!$this->isDate($fin)) return 'La date de fin est invalide.';
        if ($fin < $debut) return 'La date de fin doit être postérieure ou égale à la date de début.';

        $lieu = trim((string) ($this->data['lieu'] ?? ''));
        if ($lieu === '') return "Le champ 'lieu' est obligatoire.";

        $ville = trim((string) ($this->data['ville'] ?? ''));
        if ($ville === '') return "Le champ 'ville' est obligatoire.";

        $statut = (string) ($this->data['statut'] ?? '');
        if (!in_array($statut, ['planifie', 'en_cours', 'termine', 'annule'], true)) {
            return "Le statut est invalide.";
        }

        return null;
    }

    public function validated(): array
    {
        return [
            'titre'       => trim((string) ($this->data['titre'] ?? '')),
            'type'        => (string) ($this->data['type'] ?? 'salon'),
            'description' => trim((string) ($this->data['description'] ?? '')),
            'date_debut'  => (string) ($this->data['date_debut'] ?? ''),
            'date_fin'    => (string) ($this->data['date_fin'] ?? ''),
            'lieu'        => trim((string) ($this->data['lieu'] ?? '')),
            'ville'       => trim((string) ($this->data['ville'] ?? '')),
            'statut'      => (string) ($this->data['statut'] ?? 'planifie'),
        ];
    }

    private function isDate(string $value): bool
    {
        $date = DateTime::createFromFormat('Y-m-d', $value);
        return $date !== false && $date->format('Y-m-d') === $value;
    }
}
