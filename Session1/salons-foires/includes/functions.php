<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/** Dossier du projet dans htdocs / www (adapter si besoin). */
const BASE_URL = '/salons-foires';

const TYPES = [
    'salon' => 'Salon',
    'foire' => 'Foire',
];

const STATUTS = [
    'planifie' => 'Planifié',
    'en_cours' => 'En cours',
    'termine'  => 'Terminé',
    'annule'   => 'Annulé',
];

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function redirect(string $path): never
{
    header('Location: ' . BASE_URL . $path);
    exit;
}

function fmt_date(string $date): string
{
    return date('d/m/Y', strtotime($date));
}

/* ---------- CSRF ---------- */

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function csrf_verify(): void
{
    $sent = $_POST['csrf'] ?? '';
    if (!is_string($sent) || !hash_equals($_SESSION['csrf'] ?? '', $sent)) {
        http_response_code(419);
        exit('Session expirée. Rechargez la page et réessayez.');
    }
}

/* ---------- Messages flash ---------- */

function flash(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'msg' => $message];
}

function flashes(): array
{
    $messages = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $messages;
}

/* ---------- Helpers d'affichage ---------- */

function badge_statut(string $statut): string
{
    $label = STATUTS[$statut] ?? $statut;
    return '<span class="badge badge-' . e($statut) . '">' . e($label) . '</span>';
}

function field_error(array $errors, string $key): string
{
    return isset($errors[$key]) ? '<p class="error">' . e($errors[$key]) . '</p>' : '';
}

function delete_form(int $id, string $class = 'btn btn-danger'): string
{
    return '<form method="post" action="' . BASE_URL . '/evenements/delete.php" class="inline"'
        . ' onsubmit="return confirm(\'Supprimer cet événement ? Les stands rattachés seront supprimés aussi.\');">'
        . csrf_field()
        . '<input type="hidden" name="id" value="' . $id . '">'
        . '<button type="submit" class="' . e($class) . '">Supprimer</button>'
        . '</form>';
}

function not_found(string $message): never
{
    http_response_code(404);
    $pageTitle = 'Introuvable';
    require __DIR__ . '/header.php';
    echo '<section class="panel"><h1>Introuvable</h1><p>' . e($message) . '</p>'
        . '<p><a class="btn" href="' . BASE_URL . '/evenements/index.php">Retour à la liste</a></p></section>';
    require __DIR__ . '/footer.php';
    exit;
}

/** Pastille de dates (jours + mois) pour repérer un événement d'un coup d'œil. */
function date_tile(string $debut, string $fin): string
{
    static $mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    $d = strtotime($debut);
    $f = strtotime($fin);
    $jd = (int) date('j', $d);
    $jf = (int) date('j', $f);
    $md = $mois[(int) date('n', $d) - 1];
    $mf = $mois[(int) date('n', $f) - 1];

    if ($debut === $fin) {
        $jours = (string) $jd;
        $moisTxt = $md;
    } elseif (date('Y-n', $d) === date('Y-n', $f)) {
        $jours = $jd . '–' . $jf;
        $moisTxt = $md;
    } else {
        $jours = $jd . '–' . $jf;
        $moisTxt = rtrim($md, '.') . '–' . $mf;
    }

    return '<span class="date-tile" title="' . e(fmt_date($debut) . ' au ' . fmt_date($fin)) . '">'
        . '<b>' . e($jours) . '</b><i>' . e($moisTxt) . '</i></span>';
}
