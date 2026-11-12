<?php require_once __DIR__ . '/functions.php'; ?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle ?? 'Événements') ?> · Salons &amp; Foires</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
<header class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="<?= BASE_URL ?>/evenements/index.php">
      <span class="brand-icon">🎪</span>
      <span class="brand-text">Salons <span class="brand-amp">&amp;</span> Foires</span>
    </a>
    <nav class="topbar-nav" aria-label="Navigation principale">
      <a href="<?= BASE_URL ?>/evenements/index.php" aria-current="page">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        Événements
      </a>
    </nav>
  </div>
</header>
<main class="container">
<?php foreach (flashes() as $f): ?>
  <div class="alert alert-<?= e($f['type']) ?>" role="status">
    <span class="alert-icon"><?= $f['type'] === 'success' ? '✓' : '⚠️' ?></span>
    <span><?= e($f['msg']) ?></span>
  </div>
<?php endforeach; ?>
