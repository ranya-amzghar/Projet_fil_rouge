<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/Evenement.php';

$id        = (int) ($_GET['id'] ?? 0);
$evenement = Evenement::find($id);
if (!$evenement) {
    not_found('Cet événement n\'existe pas ou a été supprimé.');
}

$data   = $evenement;
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    [$data, $errors] = Evenement::validate($_POST);

    if (!$errors) {
        Evenement::update($id, $data);
        flash('success', 'Les modifications de « ' . $data['titre'] . ' » ont été enregistrées.');
        redirect('/evenements/show.php?id=' . $id);
    }
}

$data['description'] = (string) ($data['description'] ?? '');

$pageTitle   = 'Modifier ' . $evenement['titre'];
$submitLabel = 'Enregistrer les modifications';
$cancelUrl   = 'show.php?id=' . $id;

require __DIR__ . '/../includes/header.php';
?>
<div class="page-head">
  <h1>Modifier l'événement</h1>
</div>
<?php require __DIR__ . '/_form.php'; ?>
<?php require __DIR__ . '/../includes/footer.php'; ?>
