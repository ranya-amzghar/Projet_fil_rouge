<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/Evenement.php';

$id = (int) ($_GET['id'] ?? 0);
$ev = Evenement::find($id);
if (!$ev) {
    not_found('Cet événement n\'existe pas ou a été supprimé.');
}

$stands = Evenement::stands($id);

$standStatuts = ['disponible' => 'Disponible', 'reserve' => 'Réservé', 'occupe' => 'Occupé'];

$pageTitle = $ev['titre'];
require __DIR__ . '/../includes/header.php';
?>
<div class="page-head">
  <div class="title-with-tile">
    <?= date_tile($ev['date_debut'], $ev['date_fin']) ?>
    <div>
      <h1><?= e($ev['titre']) ?></h1>
      <p class="muted"><?= e(TYPES[$ev['type']] ?? $ev['type']) ?> · <?= badge_statut($ev['statut']) ?></p>
    </div>
  </div>
  <div class="actions">
    <a class="btn" href="index.php">Retour à la liste</a>
    <a class="btn btn-primary" href="edit.php?id=<?= $id ?>">Modifier</a>
    <?= delete_form($id) ?>
  </div>
</div>

<section class="panel">
  <dl class="details">
    <div><dt>Début</dt><dd><?= e(fmt_date($ev['date_debut'])) ?></dd></div>
    <div><dt>Fin</dt><dd><?= e(fmt_date($ev['date_fin'])) ?></dd></div>
    <div><dt>Lieu</dt><dd><?= e($ev['lieu']) ?></dd></div>
    <div><dt>Ville</dt><dd><?= e($ev['ville']) ?></dd></div>
    <div class="wide">
      <dt>Description</dt>
      <dd><?= $ev['description'] ? nl2br(e($ev['description'])) : '<span class="muted">Aucune description.</span>' ?></dd>
    </div>
    <div><dt>Créé le</dt><dd><?= e(date('d/m/Y à H:i', strtotime($ev['created_at']))) ?></dd></div>
    <div><dt>Dernière modification</dt><dd><?= e(date('d/m/Y à H:i', strtotime($ev['updated_at']))) ?></dd></div>
  </dl>
</section>

<section class="panel">
  <h2>Stands <span class="muted">(<?= count($stands) ?>)</span></h2>
  <?php if (!$stands): ?>
    <p class="muted">Aucun stand n'est rattaché à cet événement.</p>
  <?php else: ?>
    <div class="table-wrap flat">
      <table>
        <thead>
          <tr>
            <th scope="col">Stand</th>
            <th scope="col">Exposant</th>
            <th scope="col">Secteur</th>
            <th scope="col" class="num">Surface (m²)</th>
            <th scope="col" class="num">Prix (MAD)</th>
            <th scope="col">Statut</th>
          </tr>
        </thead>
        <tbody>
        <?php foreach ($stands as $s): ?>
          <tr>
            <td><?= e($s['numero']) ?></td>
            <td><?= $s['raison_sociale'] ? e($s['raison_sociale']) : '<span class="muted">—</span>' ?></td>
            <td><?= $s['secteur'] ? e($s['secteur']) : '<span class="muted">—</span>' ?></td>
            <td class="num"><?= $s['superficie'] !== null ? e(number_format((float) $s['superficie'], 2, ',', ' ')) : '—' ?></td>
            <td class="num"><?= $s['prix'] !== null ? e(number_format((float) $s['prix'], 2, ',', ' ')) : '—' ?></td>
            <td><?= e($standStatuts[$s['statut']] ?? $s['statut']) ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</section>
<?php require __DIR__ . '/../includes/footer.php'; ?>
