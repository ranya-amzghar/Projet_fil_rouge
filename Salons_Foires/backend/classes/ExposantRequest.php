<?php
declare(strict_types=1);

class ExposantRequest
{
    private array $data;

    public function __construct(mixed $data)
    {
        $this->data = is_array($data) ? $data : [];
    }

    public function validate(): ?string
    {
        if (empty($this->data)) return 'Données invalides ou corps de requête vide.';

        $rs = trim((string) ($this->data['raison_sociale'] ?? ''));
        if ($rs === '') return "Le champ 'raison_sociale' est obligatoire.";
        if (mb_strlen($rs) > 150) return 'La raison sociale ne doit pas dépasser 150 caractères.';

        $email = trim((string) ($this->data['email'] ?? ''));
        if ($email === '') return "Le champ 'email' est obligatoire.";
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return "L'email n'est pas valide.";

        $secteurId = (int) ($this->data['secteur_id'] ?? 0);
        if ($secteurId <= 0) return "Le secteur d'activité est obligatoire.";

        return null;
    }

    public function validated(): array
    {
        return [
            'raison_sociale' => trim((string) ($this->data['raison_sociale'] ?? '')),
            'email'          => trim((string) ($this->data['email'] ?? '')),
            'telephone'      => trim((string) ($this->data['telephone'] ?? '')),
            'site_web'       => trim((string) ($this->data['site_web'] ?? '')),
            'secteur_id'     => (int) ($this->data['secteur_id'] ?? 0),
        ];
    }
}
