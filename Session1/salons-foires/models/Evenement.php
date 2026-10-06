<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

class Evenement
{
    public const PER_PAGE = 10;

    /**
     * Liste paginée avec recherche (titre, lieu, ville) et filtre par statut.
     *
     * @return array{items: array, total: int, page: int, pages: int}
     */
    public static function paginate(string $q = '', string $statut = '', int $page = 1): array
    {
        $where  = [];
        $params = [];

        if ($q !== '') {
            $where[] = '(e.titre LIKE :q1 OR e.lieu LIKE :q2 OR e.ville LIKE :q3)';
            $params[':q1'] = $params[':q2'] = $params[':q3'] = '%' . $q . '%';
        }
        if ($statut !== '') {
            $where[] = 'e.statut = :statut';
            $params[':statut'] = $statut;
        }
        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $count = db()->prepare("SELECT COUNT(*) FROM evenement e $whereSql");
        $count->execute($params);
        $total = (int) $count->fetchColumn();

        $pages = max(1, (int) ceil($total / self::PER_PAGE));
        $page  = min(max(1, $page), $pages);

        $stmt = db()->prepare(
            "SELECT e.*,
                    (SELECT COUNT(*) FROM stand s WHERE s.evenement_id = e.id) AS nb_stands
             FROM evenement e
             $whereSql
             ORDER BY e.date_debut DESC, e.id DESC
             LIMIT :limit OFFSET :offset"
        );
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', self::PER_PAGE, PDO::PARAM_INT);
        $stmt->bindValue(':offset', ($page - 1) * self::PER_PAGE, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'items' => $stmt->fetchAll(),
            'total' => $total,
            'page'  => $page,
            'pages' => $pages,
        ];
    }

    public static function find(int $id): ?array
    {
        $stmt = db()->prepare('SELECT * FROM evenement WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    /** Stands d'un événement avec l'exposant et son secteur (si attribué). */
    public static function stands(int $id): array
    {
        $stmt = db()->prepare(
            'SELECT s.*, x.raison_sociale, sa.nom AS secteur
             FROM stand s
             LEFT JOIN exposant x ON x.id = s.exposant_id
             LEFT JOIN secteur_activite sa ON sa.id = x.secteur_id
             WHERE s.evenement_id = :id
             ORDER BY s.numero'
        );
        $stmt->execute([':id' => $id]);

        return $stmt->fetchAll();
    }

    public static function create(array $d): int
    {
        $stmt = db()->prepare(
            'INSERT INTO evenement (titre, type, description, date_debut, date_fin, lieu, ville, statut)
             VALUES (:titre, :type, :description, :date_debut, :date_fin, :lieu, :ville, :statut)'
        );
        $stmt->execute(self::bind($d));

        return (int) db()->lastInsertId();
    }

    public static function update(int $id, array $d): void
    {
        $stmt = db()->prepare(
            'UPDATE evenement
             SET titre = :titre, type = :type, description = :description,
                 date_debut = :date_debut, date_fin = :date_fin,
                 lieu = :lieu, ville = :ville, statut = :statut
             WHERE id = :id'
        );
        $stmt->execute(self::bind($d) + [':id' => $id]);
    }

    public static function delete(int $id): bool
    {
        $stmt = db()->prepare('DELETE FROM evenement WHERE id = :id');
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Nettoie et valide les données du formulaire.
     *
     * @return array{0: array, 1: array<string,string>} [données nettoyées, erreurs]
     */
    public static function validate(array $input): array
    {
        $text = static fn(string $key): string => trim((string) ($input[$key] ?? ''));

        $data = [
            'titre'       => $text('titre'),
            'type'        => $text('type'),
            'description' => $text('description'),
            'date_debut'  => $text('date_debut'),
            'date_fin'    => $text('date_fin'),
            'lieu'        => $text('lieu'),
            'ville'       => $text('ville'),
            'statut'      => $text('statut'),
        ];
        $errors = [];

        if ($data['titre'] === '') {
            $errors['titre'] = 'Saisissez le titre de l\'événement.';
        } elseif (mb_strlen($data['titre']) > 150) {
            $errors['titre'] = 'Le titre ne doit pas dépasser 150 caractères.';
        }

        if (!isset(TYPES[$data['type']])) {
            $errors['type'] = 'Choisissez un type d\'événement.';
        }

        $debutOk = self::isDate($data['date_debut']);
        $finOk   = self::isDate($data['date_fin']);

        if (!$debutOk) {
            $errors['date_debut'] = 'Indiquez une date de début valide.';
        }
        if (!$finOk) {
            $errors['date_fin'] = 'Indiquez une date de fin valide.';
        }
        if ($debutOk && $finOk && $data['date_fin'] < $data['date_debut']) {
            $errors['date_fin'] = 'La date de fin doit être postérieure ou égale à la date de début.';
        }

        foreach (['lieu' => 'le lieu', 'ville' => 'la ville'] as $key => $label) {
            if ($data[$key] === '') {
                $errors[$key] = "Saisissez $label.";
            } elseif (mb_strlen($data[$key]) > ($key === 'lieu' ? 150 : 100)) {
                $errors[$key] = 'Texte trop long.';
            }
        }

        if (!isset(STATUTS[$data['statut']])) {
            $errors['statut'] = 'Choisissez un statut.';
        }

        return [$data, $errors];
    }

    /** Valeurs par défaut pour le formulaire de création. */
    public static function defaults(): array
    {
        return [
            'titre' => '', 'type' => 'salon', 'description' => '',
            'date_debut' => '', 'date_fin' => '', 'lieu' => '',
            'ville' => '', 'statut' => 'planifie',
        ];
    }

    private static function bind(array $d): array
    {
        return [
            ':titre'       => $d['titre'],
            ':type'        => $d['type'],
            ':description' => $d['description'] !== '' ? $d['description'] : null,
            ':date_debut'  => $d['date_debut'],
            ':date_fin'    => $d['date_fin'],
            ':lieu'        => $d['lieu'],
            ':ville'       => $d['ville'],
            ':statut'      => $d['statut'],
        ];
    }

    private static function isDate(string $value): bool
    {
        $date = DateTime::createFromFormat('Y-m-d', $value);

        return $date !== false && $date->format('Y-m-d') === $value;
    }
}
