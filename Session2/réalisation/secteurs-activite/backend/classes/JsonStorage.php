<?php

declare(strict_types=1);

/**
 * Couche d'accès générique à un fichier JSON utilisé comme base de données.
 * Toute entité stockée doit être représentée par un tableau associatif avec une clé "id".
 */
class JsonStorage
{
    private string $filePath;

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;

        if (!file_exists($this->filePath)) {
            $directory = dirname($this->filePath);
            if (!is_dir($directory)) {
                mkdir($directory, 0775, true);
            }
            file_put_contents($this->filePath, '[]');
        }
    }

    /** Lit l'intégralité du fichier et retourne un tableau d'enregistrements. */
    public function readAll(): array
    {
        $handle = fopen($this->filePath, 'r');
        if ($handle === false) {
            throw new RuntimeException('Impossible de lire le fichier de données.');
        }

        flock($handle, LOCK_SH);
        $content = stream_get_contents($handle);
        flock($handle, LOCK_UN);
        fclose($handle);

        $data = json_decode((string) $content, true);

        return is_array($data) ? $data : [];
    }

    /** Remplace le contenu du fichier par le tableau fourni (écriture atomique avec verrou exclusif). */
    public function writeAll(array $records): void
    {
        $handle = fopen($this->filePath, 'c+');
        if ($handle === false) {
            throw new RuntimeException("Impossible d'écrire dans le fichier de données.");
        }

        flock($handle, LOCK_EX);
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode(array_values($records), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($handle);
        flock($handle, LOCK_UN);
        fclose($handle);
    }

    /** Calcule le prochain identifiant auto-incrémenté à partir des enregistrements existants. */
    public function nextId(array $records): int
    {
        $maxId = 0;
        foreach ($records as $record) {
            $maxId = max($maxId, (int) ($record['id'] ?? 0));
        }

        return $maxId + 1;
    }
}
