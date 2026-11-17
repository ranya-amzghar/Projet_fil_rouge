/**
 * Salons & Foires — Console d'Administration
 * Frontend SPA (Événements & Secteurs d'activité)
 * REST API Backend avec stockage JSON
 */

'use strict';

// ─── CONFIGURATION API ──────────────────────────────────────────────────────
const API = {
  evenements: '../backend/api/evenements.php',
  secteurs:   '../backend/api/secteurs.php',
};

// ─── APPLICATION STATE ──────────────────────────────────────────────────────
const state = {
  evenements: [],
  secteurs:   [],
  currentSection: 'evenements',
  secViewMode: 'table', // 'table' | 'cards'
};

// ─── UTILITY HELPERS ────────────────────────────────────────────────────────

/** Fetch wrapper - attend l'enveloppe standard { success, data, message } */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw new Error('Réponse invalide du serveur.');
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.message || 'Une erreur est survenue lors de la requête.');
  }
  return json.data;
}

/** Sécurise l'affichage HTML */
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

/** Formate les dates ISO en format français lisible */
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ─── TOAST NOTIFICATIONS ────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const styles = {
    success: {
      bg: 'bg-slate-900 border-emerald-500/40 text-white',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: '✓',
      title: 'Succès',
    },
    error: {
      bg: 'bg-slate-900 border-rose-500/40 text-white',
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      icon: '✕',
      title: 'Erreur',
    },
    info: {
      bg: 'bg-slate-900 border-sky-500/40 text-white',
      badge: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
      icon: 'ℹ',
      title: 'Information',
    },
  };

  const style = styles[type] || styles.info;
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-modal backdrop-blur-md ${style.bg} toast-enter text-xs sm:text-sm`;
  toast.innerHTML = `
    <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border ${style.badge}">
      ${style.icon}
    </span>
    <div class="flex-1 pt-0.5">
      <div class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-0.5">${style.title}</div>
      <div class="text-slate-200 font-medium leading-snug">${esc(message)}</div>
    </div>
    <button type="button" class="text-slate-400 hover:text-white p-1 rounded-lg transition" onclick="this.closest('.toast-enter').remove()">
      &times;
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-leave');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 4000);
}

// ─── NAVIGATION & SECTIONS ──────────────────────────────────────────────────
const SECTIONS = ['evenements', 'secteurs'];

function navigateTo(section) {
  if (!SECTIONS.includes(section)) return;
  state.currentSection = section;

  // Affichage de la section
  SECTIONS.forEach(s => {
    const el = document.getElementById(`section-${s}`);
    if (el) el.hidden = (s !== section);
  });

  // Mise à jour de la sidebar
  document.querySelectorAll('.nav-tab').forEach(btn => {
    const active = btn.dataset.nav === section;
    btn.classList.toggle('bg-slate-900', active);
    btn.classList.toggle('text-white', active);
    btn.classList.toggle('border', active);
    btn.classList.toggle('border-slate-800', active);
    btn.classList.toggle('text-slate-400', !active);

    const iconWrap = btn.querySelector('.w-8');
    if (iconWrap) {
      iconWrap.classList.toggle('bg-emerald-500/10', active);
      iconWrap.classList.toggle('text-emerald-400', active);
      iconWrap.classList.toggle('border-emerald-500/30', active);
    }
  });

  // Mise à jour du fil d'Ariane et bouton rapide
  const breadcrumb = document.getElementById('breadcrumb-current');
  const actionLabel = document.getElementById('header-action-label');
  if (breadcrumb) {
    breadcrumb.textContent = section === 'evenements' ? 'Événements' : "Secteurs d'activité";
  }
  if (actionLabel) {
    actionLabel.textContent = section === 'evenements' ? 'Nouvel événement' : 'Nouveau secteur';
  }

  // Fermeture du drawer mobile
  closeMobileSidebar();

  // Chargement des données
  loadSection(section);
}

async function loadSection(section) {
  try {
    state[section] = await apiFetch(API[section]);
    updateSidebarCounters();
    renderSection(section);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

function renderSection(section) {
  if (section === 'evenements') renderEvenements();
  else if (section === 'secteurs') renderSecteurs();
}

function updateSidebarCounters() {
  const evBadge = document.getElementById('sidebar-ev-count');
  const secBadge = document.getElementById('sidebar-sec-count');
  const evCompat = document.getElementById('ev-count');
  const secCompat = document.getElementById('sec-count');

  if (evBadge) evBadge.textContent = state.evenements.length;
  if (secBadge) secBadge.textContent = state.secteurs.length;
  if (evCompat) evCompat.textContent = state.evenements.length;
  if (secCompat) secCompat.textContent = state.secteurs.length;
}

// ─── RESPONSIVE MOBILE SIDEBAR DRAWER ───────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const sidebarOpenBtn = document.getElementById('sidebar-open-btn');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

function openMobileSidebar() {
  if (sidebar) sidebar.classList.remove('-translate-x-full');
  if (sidebarBackdrop) sidebarBackdrop.classList.remove('hidden');
}

function closeMobileSidebar() {
  if (sidebar) sidebar.classList.add('-translate-x-full');
  if (sidebarBackdrop) sidebarBackdrop.classList.add('hidden');
}

if (sidebarOpenBtn) sidebarOpenBtn.addEventListener('click', openMobileSidebar);
if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

// ─── BOUTON D'ACTION EN-TÊTE ────────────────────────────────────────────────
const headerActionBtn = document.getElementById('header-action-btn');
if (headerActionBtn) {
  headerActionBtn.addEventListener('click', () => {
    showForm(state.currentSection, null);
  });
}

// ─── MODALES (FORMULAIRE & DÉTAILS) ─────────────────────────────────────────
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle   = document.getElementById('modal-title');
const modalBody    = document.getElementById('modal-body');

function openModal(title, bodyHTML) {
  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) modalBody.innerHTML = bodyHTML;
  if (modalOverlay) modalOverlay.hidden = false;
  document.body.classList.add('overflow-hidden');
}

function closeModal() {
  if (modalOverlay) modalOverlay.hidden = true;
  if (modalBody) modalBody.innerHTML = '';
  document.body.classList.remove('overflow-hidden');
}

const modalClose = document.getElementById('modal-close');
if (modalClose) modalClose.addEventListener('click', closeModal);

if (modalOverlay) {
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
}

// ─── MODALE DE SUPPRESSION SÉCURISÉE ─────────────────────────────────────────
const deleteOverlay = document.getElementById('delete-overlay');
const deleteMsg     = document.getElementById('delete-msg');
const deleteCancel  = document.getElementById('delete-cancel');
const deleteConfirm = document.getElementById('delete-confirm');

let _deleteCallback = null;

function confirmDelete(message, callback) {
  if (deleteMsg) deleteMsg.textContent = message;
  _deleteCallback = callback;
  if (deleteOverlay) deleteOverlay.hidden = false;
  document.body.classList.add('overflow-hidden');
}

function closeDeleteModal() {
  if (deleteOverlay) deleteOverlay.hidden = true;
  _deleteCallback = null;
  document.body.classList.remove('overflow-hidden');
}

if (deleteCancel) deleteCancel.addEventListener('click', closeDeleteModal);
if (deleteOverlay) {
  deleteOverlay.addEventListener('click', e => {
    if (e.target === deleteOverlay) closeDeleteModal();
  });
}

if (deleteConfirm) {
  deleteConfirm.addEventListener('click', async () => {
    const cb = _deleteCallback;
    closeDeleteModal();
    if (cb) await cb();
  });
}

// ─── BADGES DE STATUT & TYPES ───────────────────────────────────────────────
function statutEvBadge(statut) {
  const map = {
    planifie: {
      pill: 'bg-sky-50 text-sky-700 border-sky-200/80',
      dot: 'bg-sky-500',
      label: 'Planifié',
    },
    en_cours: {
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500 animate-pulse',
      label: 'En cours',
    },
    termine: {
      pill: 'bg-slate-100 text-slate-700 border-slate-200/80',
      dot: 'bg-slate-400',
      label: 'Terminé',
    },
    annule: {
      pill: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
      label: 'Annulé',
    },
  };

  const c = map[statut] || { pill: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: statut };
  return `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${c.pill} shadow-xs">
      <span class="w-1.5 h-1.5 rounded-full ${c.dot}"></span>
      <span>${c.label}</span>
    </span>`;
}

function typeBadge(type) {
  const map = {
    salon: {
      pill: 'bg-violet-50 text-violet-700 border-violet-200/80',
      icon: '🎪',
      label: 'Salon',
    },
    foire: {
      pill: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: '🌟',
      label: 'Foire',
    },
  };
  const c = map[type] || { pill: 'bg-slate-100 text-slate-600 border-slate-200', icon: '📍', label: type };
  return `
    <span class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border ${c.pill}">
      <span>${c.icon}</span>
      <span>${c.label}</span>
    </span>`;
}

/** Boutons d'actions en fin de ligne (Détails, Modifier, Supprimer) */
function actionBtns(entity, id) {
  return `
    <div class="flex items-center justify-end gap-1.5">
      <button type="button" onclick="showDetails('${entity}',${id})" title="Consulter les détails"
        class="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition shadow-xs">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
      </button>
      <button type="button" onclick="openEdit('${entity}',${id})" title="Modifier cet enregistrement"
        class="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-amber-600 flex items-center justify-center transition shadow-xs">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      </button>
      <button type="button" onclick="deleteItem('${entity}',${id})" title="Supprimer cet enregistrement"
        class="w-8 h-8 rounded-lg border border-slate-200/80 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition shadow-xs">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>`;
}

// ─── SECTION ÉVÉNEMENTS ──────────────────────────────────────────────────────
const evAddBtn = document.getElementById('ev-add-btn');
const evSearch = document.getElementById('ev-search');
const evFilterStatut = document.getElementById('ev-filter-statut');
const evSearchClear = document.getElementById('ev-search-clear');

if (evAddBtn) evAddBtn.addEventListener('click', () => showForm('evenements', null));

if (evSearch) {
  evSearch.addEventListener('input', () => {
    if (evSearchClear) evSearchClear.classList.toggle('hidden', evSearch.value.trim() === '');
    renderEvenements();
  });
}

if (evSearchClear) {
  evSearchClear.addEventListener('click', () => {
    evSearch.value = '';
    evSearchClear.classList.add('hidden');
    renderEvenements();
  });
}

if (evFilterStatut) {
  evFilterStatut.addEventListener('change', renderEvenements);
}

// Boutons pilules de filtre statut
document.querySelectorAll('.ev-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const statusVal = btn.dataset.status || '';
    if (evFilterStatut) evFilterStatut.value = statusVal;

    document.querySelectorAll('.ev-pill').forEach(b => {
      const active = (b === btn);
      b.classList.toggle('bg-white', active);
      b.classList.toggle('text-slate-900', active);
      b.classList.toggle('shadow-subtle', active);
      b.classList.toggle('font-bold', active);
      b.classList.toggle('text-slate-600', !active);
    });

    renderEvenements();
  });
});

function renderEvenements() {
  const search = evSearch ? evSearch.value.trim().toLowerCase() : '';
  const statut = evFilterStatut ? evFilterStatut.value : '';

  // Mise à jour des KPI métriques globales
  const total = state.evenements.length;
  const salons = state.evenements.filter(e => e.type === 'salon').length;
  const foires = state.evenements.filter(e => e.type === 'foire').length;
  const actifs = state.evenements.filter(e => e.statut === 'en_cours' || e.statut === 'planifie').length;

  const kTotal = document.getElementById('kpi-ev-total');
  const kSalons = document.getElementById('kpi-ev-salons');
  const kFoires = document.getElementById('kpi-ev-foires');
  const kActifs = document.getElementById('kpi-ev-actifs');

  if (kTotal) kTotal.textContent = total;
  if (kSalons) kSalons.textContent = salons;
  if (kFoires) kFoires.textContent = foires;
  if (kActifs) kActifs.textContent = actifs;

  // Filtrage des éléments
  const list = state.evenements.filter(ev => {
    const matchText = !search || [ev.titre, ev.lieu, ev.ville, ev.description].join(' ').toLowerCase().includes(search);
    const matchSt = !statut || ev.statut === statut;
    return matchText && matchSt;
  });

  const tableWrap = document.getElementById('ev-table-wrap');
  const tbody = document.getElementById('ev-table-body');
  const empty = document.getElementById('ev-empty');

  if (list.length === 0) {
    if (tableWrap) tableWrap.classList.add('hidden');
    if (empty) empty.classList.remove('hidden');
  } else {
    if (tableWrap) tableWrap.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    if (tbody) {
      tbody.innerHTML = list.map(ev => `
        <tr class="hover:bg-slate-50/70 transition-colors group">
          <td class="py-4 pl-6 pr-4 align-middle">
            <button type="button" onclick="showDetails('evenements',${ev.id})" class="text-left font-bold text-slate-900 group-hover:text-emerald-700 transition tracking-tight text-sm block">
              ${esc(ev.titre)}
            </button>
            <span class="text-[11px] text-slate-400 font-mono">ID #${ev.id}</span>
          </td>
          <td class="py-4 px-4 align-middle">${typeBadge(ev.type)}</td>
          <td class="py-4 px-4 align-middle text-xs font-mono font-medium text-slate-600 whitespace-nowrap">
            <div class="flex items-center gap-1.5">
              <span>${fmtDate(ev.date_debut)}</span>
              <span class="text-slate-300">→</span>
              <span>${fmtDate(ev.date_fin)}</span>
            </div>
          </td>
          <td class="py-4 px-4 align-middle text-xs text-slate-600">
            <div class="font-medium text-slate-800">${esc(ev.lieu)}</div>
            <div class="text-[11px] text-slate-400 font-mono">${esc(ev.ville)}</div>
          </td>
          <td class="py-4 px-4 align-middle">${statutEvBadge(ev.statut)}</td>
          <td class="py-4 pl-4 pr-6 align-middle text-right">${actionBtns('evenements', ev.id)}</td>
        </tr>`).join('');
    }
  }
}

function evFormHTML(ev = null) {
  const v = f => esc(ev ? (ev[f] ?? '') : '');
  const sel = (f, val) => ev && ev[f] === val ? 'selected' : '';

  return `
    <form id="entity-form" class="space-y-4" novalidate>
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Titre de l'événement <span class="text-rose-500">*</span>
        </label>
        <input name="titre" type="text" value="${v('titre')}" required maxlength="150" placeholder="Ex : Salon International du BTP 2026"
          class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition font-medium">
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Type d'événement <span class="text-rose-500">*</span>
          </label>
          <select name="type" class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition font-medium">
            <option value="salon" ${sel('type','salon')}>🎪 Salon Professionnel</option>
            <option value="foire" ${sel('type','foire')}>🌟 Foire Commerciale</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Statut actuel <span class="text-rose-500">*</span>
          </label>
          <select name="statut" class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition font-medium">
            <option value="planifie" ${sel('statut','planifie')}>Planifié</option>
            <option value="en_cours" ${sel('statut','en_cours')}>En cours</option>
            <option value="termine"  ${sel('statut','termine')}>Terminé</option>
            <option value="annule"   ${sel('statut','annule')}>Annulé</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Date d'ouverture <span class="text-rose-500">*</span>
          </label>
          <input name="date_debut" type="date" value="${v('date_debut')}" required
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition font-mono">
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Date de clôture <span class="text-rose-500">*</span>
          </label>
          <input name="date_fin" type="date" value="${v('date_fin')}" required
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition font-mono">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Lieu / Site <span class="text-rose-500">*</span>
          </label>
          <input name="lieu" type="text" value="${v('lieu')}" required maxlength="150" placeholder="Ex : Palais des Expositions"
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition font-medium">
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Ville hôte <span class="text-rose-500">*</span>
          </label>
          <input name="ville" type="text" value="${v('ville')}" required maxlength="100" placeholder="Ex : Tanger"
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition font-medium">
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Description &amp; Programme
        </label>
        <textarea name="description" rows="3" placeholder="Présentation générale, exposants attendus et public cible..."
          class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition resize-none leading-relaxed">${v('description')}</textarea>
      </div>

      <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
        <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
          Annuler
        </button>
        <button type="submit" class="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm hover:shadow active:scale-[0.98]">
          ${ev ? 'Enregistrer les modifications' : 'Créer l\'événement'}
        </button>
      </div>
    </form>`;
}

function evDetailsHTML(ev) {
  return `
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div>
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Fiche Événement</span>
          <h3 class="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">${esc(ev.titre)}</h3>
        </div>
        <div class="flex flex-col items-end gap-1">
          ${statutEvBadge(ev.statut)}
          <span class="text-[11px] font-mono text-slate-400">ID #${ev.id}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Type</span>
          <div class="font-semibold text-slate-800 text-xs sm:text-sm">${typeBadge(ev.type)}</div>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lieu &amp; Ville</span>
          <div class="font-bold text-slate-800 text-xs sm:text-sm">${esc(ev.lieu)}, ${esc(ev.ville)}</div>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ouverture</span>
          <div class="font-mono font-bold text-slate-800 text-xs sm:text-sm">${fmtDate(ev.date_debut)}</div>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Clôture</span>
          <div class="font-mono font-bold text-slate-800 text-xs sm:text-sm">${fmtDate(ev.date_fin)}</div>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description complète</span>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${esc(ev.description) || '<span class="italic text-slate-400">Aucune description renseignée.</span>'}</p>
      </div>

      <div class="flex justify-end pt-2">
        <button type="button" onclick="closeModal()" class="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition">
          Fermer
        </button>
      </div>
    </div>`;
}

// ─── SECTION SECTEURS D'ACTIVITÉ ────────────────────────────────────────────
const secAddBtn = document.getElementById('sec-add-btn');
const secSearch = document.getElementById('sec-search');
const viewModeTable = document.getElementById('view-mode-table');
const viewModeCards = document.getElementById('view-mode-cards');

if (secAddBtn) secAddBtn.addEventListener('click', () => showForm('secteurs', null));

if (secSearch) {
  secSearch.addEventListener('input', renderSecteurs);
}

if (viewModeTable && viewModeCards) {
  viewModeTable.addEventListener('click', () => {
    state.secViewMode = 'table';
    viewModeTable.classList.add('bg-white', 'text-slate-900', 'shadow-subtle');
    viewModeTable.classList.remove('text-slate-500');
    viewModeCards.classList.remove('bg-white', 'text-slate-900', 'shadow-subtle');
    viewModeCards.classList.add('text-slate-500');
    renderSecteurs();
  });

  viewModeCards.addEventListener('click', () => {
    state.secViewMode = 'cards';
    viewModeCards.classList.add('bg-white', 'text-slate-900', 'shadow-subtle');
    viewModeCards.classList.remove('text-slate-500');
    viewModeTable.classList.remove('bg-white', 'text-slate-900', 'shadow-subtle');
    viewModeTable.classList.add('text-slate-500');
    renderSecteurs();
  });
}

function renderSecteurs() {
  const search = secSearch ? secSearch.value.trim().toLowerCase() : '';

  // KPI Métriques
  const total = state.secteurs.length;
  const documented = state.secteurs.filter(s => (s.description || '').trim() !== '').length;
  const uniqueColors = new Set(state.secteurs.map(s => s.couleur)).size;

  const kTotal = document.getElementById('kpi-sec-total');
  const kDoc = document.getElementById('kpi-sec-documented');
  const kPal = document.getElementById('kpi-sec-palette');

  if (kTotal) kTotal.textContent = total;
  if (kDoc) kDoc.textContent = documented;
  if (kPal) kPal.textContent = uniqueColors;

  // Filtrage
  const list = state.secteurs.filter(s =>
    !search || [s.nom, s.description, s.couleur].join(' ').toLowerCase().includes(search)
  );

  const tableWrap = document.getElementById('sec-table-wrap');
  const tbody = document.getElementById('sec-table-body');
  const cardsWrap = document.getElementById('sec-cards-wrap');
  const empty = document.getElementById('sec-empty');

  if (list.length === 0) {
    if (tableWrap) tableWrap.classList.add('hidden');
    if (cardsWrap) cardsWrap.classList.add('hidden');
    if (empty) empty.classList.remove('hidden');
  } else {
    if (empty) empty.classList.add('hidden');

    if (state.secViewMode === 'cards') {
      if (tableWrap) tableWrap.classList.add('hidden');
      if (cardsWrap) {
        cardsWrap.classList.remove('hidden');
        cardsWrap.innerHTML = list.map(sec => `
          <div class="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition flex flex-col justify-between group">
            <div>
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-3">
                  <span class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-slate-200/80 shadow-xs group-hover:scale-105 transition-transform" style="background:${esc(sec.couleur)}15">
                    ${esc(sec.icone)}
                  </span>
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">${esc(sec.nom)}</h3>
                    <span class="text-[11px] font-mono text-slate-400">ID #${sec.id}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 font-mono text-[11px] font-bold text-slate-600">
                  <span class="w-2.5 h-2.5 rounded-full" style="background:${esc(sec.couleur)}"></span>
                  <span>${esc(sec.couleur)}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                ${esc(sec.description) || '<span class="italic text-slate-400">Aucune description disponible.</span>'}
              </p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-end">
              ${actionBtns('secteurs', sec.id)}
            </div>
          </div>
        `).join('');
      }
    } else {
      if (cardsWrap) cardsWrap.classList.add('hidden');
      if (tableWrap) tableWrap.classList.remove('hidden');
      if (tbody) {
        tbody.innerHTML = list.map(sec => `
          <tr class="hover:bg-slate-50/70 transition-colors group">
            <td class="py-4 pl-6 pr-3 text-center align-middle w-16">
              <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl border border-slate-200/80 shadow-xs group-hover:scale-105 transition-transform" style="background:${esc(sec.couleur)}15">
                ${esc(sec.icone)}
              </span>
            </td>
            <td class="py-4 px-4 align-middle">
              <button type="button" onclick="showDetails('secteurs',${sec.id})" class="text-left font-bold text-slate-900 group-hover:text-emerald-700 transition tracking-tight text-sm block">
                ${esc(sec.nom)}
              </button>
              <span class="text-[11px] text-slate-400 font-mono">ID #${sec.id}</span>
            </td>
            <td class="py-4 px-4 align-middle">
              <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                <span class="w-3.5 h-3.5 rounded-full shadow-xs border border-white" style="background:${esc(sec.couleur)}"></span>
                <span class="font-mono text-xs text-slate-700 font-bold">${esc(sec.couleur)}</span>
              </div>
            </td>
            <td class="py-4 px-4 align-middle text-xs text-slate-600 max-w-sm">
              <p class="line-clamp-2 leading-relaxed">${esc(sec.description) || '<span class="text-slate-400 italic font-normal">Aucune description</span>'}</p>
            </td>
            <td class="py-4 pl-4 pr-6 align-middle text-right">${actionBtns('secteurs', sec.id)}</td>
          </tr>
        `).join('');
      }
    }
  }
}

function secFormHTML(sec = null) {
  const v = f => esc(sec ? (sec[f] ?? '') : '');
  const couleur = sec?.couleur ?? '#0f172a';

  return `
    <form id="entity-form" class="space-y-4" novalidate>
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Intitulé du secteur <span class="text-rose-500">*</span>
        </label>
        <input name="nom" type="text" value="${v('nom')}" required maxlength="100" placeholder="Ex : Agroalimentaire &amp; Terroir"
          class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition font-medium">
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Icône / Émoji <span class="text-rose-500">*</span>
          </label>
          <input name="icone" type="text" value="${v('icone')}" required maxlength="10" placeholder="Ex : 🌾, 🏺, 💻"
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-center text-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition">
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Couleur associée <span class="text-rose-500">*</span>
          </label>
          <div class="flex items-center gap-2">
            <input type="color" id="couleur-picker" value="${esc(couleur)}"
              oninput="document.getElementById('couleur-input').value = this.value"
              class="h-10 w-12 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer">
            <input name="couleur" id="couleur-input" type="text" value="${esc(couleur)}" required maxlength="7"
              oninput="try{document.getElementById('couleur-picker').value=this.value}catch(e){}"
              class="flex-1 px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition">
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Description des filières <span class="text-rose-500">*</span>
        </label>
        <textarea name="description" rows="3" required maxlength="1000" placeholder="Détaillez les catégories d'entreprises, produits ou savoir-faire rattachés à ce secteur..."
          class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition resize-none leading-relaxed">${v('description')}</textarea>
      </div>

      <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
        <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
          Annuler
        </button>
        <button type="submit" class="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm hover:shadow active:scale-[0.98]">
          ${sec ? 'Enregistrer les modifications' : 'Créer le secteur'}
        </button>
      </div>
    </form>`;
}

function secDetailsHTML(sec) {
  return `
    <div class="space-y-4">
      <div class="flex items-center gap-4 pb-4 border-b border-slate-100">
        <span class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-slate-200/80 shadow-xs" style="background:${esc(sec.couleur)}15">
          ${esc(sec.icone)}
        </span>
        <div>
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Domaine d'activité</span>
          <h3 class="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">${esc(sec.nom)}</h3>
          <span class="text-[11px] font-mono text-slate-400">ID #${sec.id}</span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Code couleur</span>
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded-full border border-white shadow-xs" style="background:${esc(sec.couleur)}"></span>
          <span class="font-mono text-xs font-bold text-slate-800">${esc(sec.couleur)}</span>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</span>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${esc(sec.description) || '<span class="italic text-slate-400">Aucune description disponible.</span>'}</p>
      </div>

      <div class="flex justify-end pt-2">
        <button type="button" onclick="closeModal()" class="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition">
          Fermer
        </button>
      </div>
    </div>`;
}

// ─── GESTION CRUD GÉNÉRIQUE ─────────────────────────────────────────────────
const ENTITY_LABELS = {
  evenements: { singular: 'événement', article: 'cet', title: 'Événement' },
  secteurs:   { singular: 'secteur',   article: 'ce',   title: 'Secteur'   },
};

function showForm(entity, item) {
  const label = ENTITY_LABELS[entity] || { singular: entity, article: 'cet', title: entity };
  const title = item ? `Modifier le ${label.singular}` : `Ajouter un ${label.singular}`;
  const html = entity === 'evenements' ? evFormHTML(item) : secFormHTML(item);
  openModal(title, html);

  const form = document.getElementById('entity-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    const submitBtn = form.querySelector('[type=submit]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>Enregistrement...</span>
        </span>`;
    }

    try {
      if (item) {
        await apiFetch(`${API[entity]}?id=${item.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        showToast(`${label.title} modifié avec succès !`, 'success');
      } else {
        await apiFetch(API[entity], {
          method: 'POST',
          body: JSON.stringify(data),
        });
        showToast(`${label.title} ajouté avec succès !`, 'success');
      }
      closeModal();
      await loadSection(entity);
    } catch (err) {
      showToast(err.message, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = item ? 'Enregistrer les modifications' : `Créer le ${label.singular}`;
      }
    }
  });
}

async function showDetails(entity, id) {
  try {
    const item = await apiFetch(`${API[entity]}?id=${id}`);
    const label = ENTITY_LABELS[entity];
    const html = entity === 'evenements' ? evDetailsHTML(item) : secDetailsHTML(item);
    openModal(`Détails – ${label.title}`, html);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function openEdit(entity, id) {
  try {
    const item = await apiFetch(`${API[entity]}?id=${id}`);
    showForm(entity, item);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function deleteItem(entity, id) {
  const label = ENTITY_LABELS[entity];
  confirmDelete(
    `Êtes-vous sûr de vouloir supprimer définitivement ${label.article} ${label.singular} ?`,
    async () => {
      try {
        await apiFetch(`${API[entity]}?id=${id}`, { method: 'DELETE' });
        showToast(`${label.title} supprimé avec succès.`, 'success');
        await loadSection(entity);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  );
}

// ─── INITIALISATION ─────────────────────────────────────────────────────────
document.querySelectorAll('.nav-tab').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.nav));
});

// Affiche la date du jour dans le chip de l'en-tête
const dateNowText = document.getElementById('date-now-text');
if (dateNowText) {
  const now = new Date();
  dateNowText.textContent = now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Démarrage sur la section des Événements
navigateTo('evenements');
