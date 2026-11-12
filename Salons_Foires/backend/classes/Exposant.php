<?php
declare(strict_types=1);

class Exposant
{
    private ?int $id;
    private string $raison_sociale;
    private string $email;
    private string $telephone;
    private string $site_web;
    private int $secteur_id;

    public function __construct(?int $id, string $raison_sociale, string $email, string $telephone, string $site_web, int $secteur_id)
    {
        $this->id = $id;
        $this->raison_sociale = trim($raison_sociale);
        $this->email = trim($email);
        $this->telephone = trim($telephone);
        $this->site_web = trim($site_web);
        $this->secteur_id = $secteur_id;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            (string) ($data['raison_sociale'] ?? ''),
            (string) ($data['email'] ?? ''),
            (string) ($data['telephone'] ?? ''),
            (string) ($data['site_web'] ?? ''),
            (int) ($data['secteur_id'] ?? 0)
        );
    }

    public function toArray(): array
    {
        return [
            'id'             => $this->id,
            'raison_sociale' => $this->raison_sociale,
            'email'          => $this->email,
            'telephone'      => $this->telephone,
            'site_web'       => $this->site_web,
            'secteur_id'     => $this->secteur_id,
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(int $id): void { $this->id = $id; }
    public function getRaisonSociale(): string { return $this->raison_sociale; }
    public function getEmail(): string { return $this->email; }
    public function getSecteurId(): int { return $this->secteur_id; }
}
