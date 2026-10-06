<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/Evenement.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/evenements/index.php');
}

csrf_verify();

$id = (int) ($_POST['id'] ?? 0);
$ev = Evenement::find($id);

if (!$ev) {
    flash('error', 'Cet événement n\'existe plus.');
    redirect('/evenements/index.php');
}

try {
    Evenement::delete($id);
    flash('success', 'L\'événement « ' . $ev['titre'] . ' » a été supprimé.');
} catch (PDOException $e) {
    flash('error', 'La suppression a échoué. Réessayez dans un instant.');
}

redirect('/evenements/index.php');
