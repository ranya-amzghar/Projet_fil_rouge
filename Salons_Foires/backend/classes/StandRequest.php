<?php
declare(strict_types=1);

class StandRequest
{
    private array $data;

    public function __construct(mixed $data)
    {
        $this->data = is_array($data) ? $data : [];
    }

    public function validate(): ?string
    {
        if (empty($this->data)) return 'Données invalides ou corps de requête vide.';

        $numero = trim((string) ($this->data['numero'] ?? ''));
        if ($numero === '') return "Le champ 'numero' est obligatoire.";

        $statut = (string) ($this->data['statut'] ?? '');
        if (!in_array($statut, ['disponible', 'reserve', 'occupe'], true)) return "Le statut est invalide.";

        $evenementId = (int) ($this->data['evenement_id'] ?? 0);
        if ($evenementId <= 0) return "L'événement est obligatoire.";

        return null;
    }

    public function validated(): array
    {
        $superficieRaw = $this->data['superficie'] ?? null;
        $prixRaw = $this->data['prix'] ?? null;
        $exposantRaw = $this->data['exposant_id'] ?? null;

        return [
            'numero'       => trim((string) ($this->data['numero'] ?? '')),
            'superficie'   => ($superficieRaw !== null && $superficieRaw !== '') ? (float) $superficieRaw : null,
            'prix'         => ($prixRaw !== null && $prixRaw !== '') ? (float) $prixRaw : null,
            'statut'       => (string) ($this->data['statut'] ?? 'disponible'),
            'evenement_id' => (int) ($this->data['evenement_id'] ?? 0),
            'exposant_id'  => ($exposantRaw !== null && $exposantRaw !== '') ? (int) $exposantRaw : null,
        ];
    }
}
