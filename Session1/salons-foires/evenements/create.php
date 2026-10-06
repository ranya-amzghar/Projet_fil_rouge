<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/Evenement.php';

$data   = Evenement::defaults();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    [$data, $errors] = Evenement::validate($_POST);

    if (!$errors) {
        $id = Evenement::create($data);
        flash('success', 'L\'événement « ' . $data['titre'] . ' » a été ajouté.');
        redirect('/evenements/show.php?id=' . $id);
    }
}

$pageTitle   = 'Ajouter un événement';
$submitLabel = 'Ajouter l\'événement';
$cancelUrl   = 'index.php';

require __DIR__ . '/../includes/header.php';
?>
<div class="page-head">
  <h1>Ajouter un événement</h1>
</div>
<?php require __DIR__ . '/_form.php'; ?>
<?php require __DIR__ . '/../includes/footer.php'; ?>
