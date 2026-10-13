<?php
/**
 * Formulaire partagé création / modification.
 * Variables attendues : $data (array), $errors (array), $submitLabel (string), $cancelUrl (string)
 */
$invalid = static fn(string $key): string => isset($errors[$key]) ? ' has-error' : '';
?>
<form method="post" class="panel form" novalidate>
  <?= csrf_field() ?>

  <div class="field<?= $invalid('titre') ?>">
    <label for="titre">Titre</label>
    <input id="titre" name="titre" type="text" maxlength="150" required value="<?= e($data['titre']) ?>">
    <?= field_error($errors, 'titre') ?>
  </div>

  <div class="grid-2">
    <div class="field<?= $invalid('type') ?>">
      <label for="type">Type</label>
      <select id="type" name="type" required>
        <?php foreach (TYPES as $value => $label): ?>
          <option value="<?= e($value) ?>" <?= $data['type'] === $value ? 'selected' : '' ?>><?= e($label) ?></option>
        <?php endforeach; ?>
      </select>
      <?= field_error($errors, 'type') ?>
    </div>
    <div class="field<?= $invalid('statut') ?>">
      <label for="statut">Statut</label>
      <select id="statut" name="statut" required>
        <?php foreach (STATUTS as $value => $label): ?>
          <option value="<?= e($value) ?>" <?= $data['statut'] === $value ? 'selected' : '' ?>><?= e($label) ?></option>
        <?php endforeach; ?>
      </select>
      <?= field_error($errors, 'statut') ?>
    </div>
  </div>

  <div class="grid-2">
    <div class="field<?= $invalid('date_debut') ?>">
      <label for="date_debut">Date de début</label>
      <input id="date_debut" name="date_debut" type="date" required value="<?= e($data['date_debut']) ?>">
      <?= field_error($errors, 'date_debut') ?>
    </div>
    <div class="field<?= $invalid('date_fin') ?>">
      <label for="date_fin">Date de fin</label>
      <input id="date_fin" name="date_fin" type="date" required value="<?= e($data['date_fin']) ?>">
      <?= field_error($errors, 'date_fin') ?>
    </div>
  </div>

  <div class="grid-2">
    <div class="field<?= $invalid('lieu') ?>">
      <label for="lieu">Lieu</label>
      <input id="lieu" name="lieu" type="text" maxlength="150" required value="<?= e($data['lieu']) ?>">
      <?= field_error($errors, 'lieu') ?>
    </div>
    <div class="field<?= $invalid('ville') ?>">
      <label for="ville">Ville</label>
      <input id="ville" name="ville" type="text" maxlength="100" required value="<?= e($data['ville']) ?>">
      <?= field_error($errors, 'ville') ?>
    </div>
  </div>

  <div class="field">
    <label for="description">Description</label>
    <textarea id="description" name="description" rows="5"><?= e($data['description']) ?></textarea>
  </div>

  <div class="form-actions">
    <button type="submit" class="btn btn-primary"><?= e($submitLabel) ?></button>
    <a class="btn btn-ghost" href="<?= e($cancelUrl) ?>">Annuler</a>
  </div>
</form>
