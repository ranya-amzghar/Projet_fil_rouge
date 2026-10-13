<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/Evenement.php';

$q      = trim((string) ($_GET['q'] ?? ''));
$statut = (string) ($_GET['statut'] ?? '');
if (!isset(STATUTS[$statut])) {
    $statut = '';
}

$result = Evenement::paginate($q, $statut, (int) ($_GET['page'] ?? 1));
$filtered = ($q !== '' || $statut !== '');

$pageUrl = static fn(int $p): string => '?' . http_build_query(array_filter(
    ['q' => $q, 'statut' => $statut, 'page' => $p > 1 ? $p : null],
    static fn($v) => $v !== null && $v !== ''
));

$pageTitle = 'Événements';
require __DIR__ . '/../includes/header.php';
?>
<div class="page-head">
  <div>
    <h1>Événements</h1>
    <p class="muted"><?= $result['total'] ?> <?= $result['total'] > 1 ? 'événements' : 'événement' ?><?= $filtered ? ' correspondant à votre recherche' : '' ?></p>
  </div>
  <a class="btn btn-primary" href="create.php">Ajouter un événement</a>
</div>

<form method="get" class="filters" role="search">
  <div class="field">
    <label for="q">Rechercher</label>
    <input id="q" name="q" type="search" placeholder="Titre, lieu ou ville" value="<?= e($q) ?>">
  </div>
  <div class="field">
    <label for="statut">Statut</label>
    <select id="statut" name="statut">
      <option value="">Tous</option>
      <?php foreach (STATUTS as $value => $label): ?>
        <option value="<?= e($value) ?>" <?= $statut === $value ? 'selected' : '' ?>><?= e($label) ?></option>
      <?php endforeach; ?>
    </select>
  </div>
  <button type="submit" class="btn">Filtrer</button>
  <?php if ($filtered): ?><a class="btn btn-ghost" href="index.php">Réinitialiser</a><?php endif; ?>
</form>

<?php if (!$result['items']): ?>
  <section class="panel empty">
    <h2><?= $filtered ? 'Aucun résultat' : 'Aucun événement pour le moment' ?></h2>
    <p><?= $filtered ? 'Modifiez votre recherche ou réinitialisez les filtres.' : 'Ajoutez votre premier salon ou foire pour commencer.' ?></p>
    <a class="btn btn-primary" href="create.php">Ajouter un événement</a>
  </section>
<?php else: ?>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th scope="col">Dates</th>
          <th scope="col">Événement</th>
          <th scope="col">Lieu</th>
          <th scope="col">Statut</th>
          <th scope="col" class="num">Stands</th>
          <th scope="col"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
      <?php foreach ($result['items'] as $ev): ?>
        <tr>
          <td><?= date_tile($ev['date_debut'], $ev['date_fin']) ?></td>
          <td>
            <a class="row-title" href="show.php?id=<?= (int) $ev['id'] ?>"><?= e($ev['titre']) ?></a>
            <div class="muted"><?= e(TYPES[$ev['type']] ?? $ev['type']) ?></div>
          </td>
          <td><?= e($ev['lieu']) ?><div class="muted"><?= e($ev['ville']) ?></div></td>
          <td><?= badge_statut($ev['statut']) ?></td>
          <td class="num"><?= (int) $ev['nb_stands'] ?></td>
          <td class="actions">
            <a class="btn btn-sm" href="show.php?id=<?= (int) $ev['id'] ?>">Détails</a>
            <a class="btn btn-sm" href="edit.php?id=<?= (int) $ev['id'] ?>">Modifier</a>
            <?= delete_form((int) $ev['id'], 'btn btn-sm btn-danger') ?>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <?php if ($result['pages'] > 1): ?>
    <nav class="pagination" aria-label="Pagination">
      <?php if ($result['page'] > 1): ?>
        <a class="btn btn-sm" href="<?= e($pageUrl($result['page'] - 1)) ?>">Précédent</a>
      <?php endif; ?>
      <span class="muted">Page <?= $result['page'] ?> sur <?= $result['pages'] ?></span>
      <?php if ($result['page'] < $result['pages']): ?>
        <a class="btn btn-sm" href="<?= e($pageUrl($result['page'] + 1)) ?>">Suivant</a>
      <?php endif; ?>
    </nav>
  <?php endif; ?>
<?php endif; ?>
<?php require __DIR__ . '/../includes/footer.php'; ?>
