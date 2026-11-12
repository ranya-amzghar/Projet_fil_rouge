/**
 * Salons & Foires — SPA (Événements + Secteurs)
 * PHP REST API + JSON Storage backend
 */

'use strict';

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const API = {
  evenements: '../backend/api/evenements.php',
  secteurs:   '../backend/api/secteurs.php',
};

// ─── STATE ──────────────────────────────────────────────────────────────────
const state = {
  evenements: [],
  secteurs:   [],
};

// ─── UTILS ──────────────────────────────────────────────────────────────────

/** Fetch wrapper — expects { success, data } envelope */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Erreur API');
  return json.data;
}

/** HTML-escape a string */
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

/** Format ISO date to dd/mm/yyyy */
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ─── TOAST ──────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const colors = {
    success: 'bg-emerald-600',
    error:   'bg-red-600',
    info:    'bg-indigo-600',
  };
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold ${colors[type] || colors.info} toast-enter`;
  toast.innerHTML = `<span class="text-base leading-none">${icons[type] || icons.info}</span><span class="flex-1">${esc(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-leave');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3500);
}

// ─── NAVIGATION ─────────────────────────────────────────────────────────────
const SECTIONS = ['evenements', 'secteurs'];

function navigateTo(section) {
  SECTIONS.forEach(s => {
    document.getElementById(`section-${s}`).hidden = s !== section;
  });
  document.querySelectorAll('.nav-tab').forEach(btn => {
    const active = btn.dataset.nav === section;
    btn.classList.toggle('bg-white/20', active);
    btn.classList.toggle('text-white',  active);
    btn.classList.toggle('text-slate-300', !active);
  });
  loadSection(section);
}

document.querySelectorAll('.nav-tab').forEach(btn =>
  btn.addEventListener('click', () => navigateTo(btn.dataset.nav))
);

async function loadSection(section) {
  try {
    state[section] = await apiFetch(API[section]);
    renderSection(section);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

function renderSection(section) {
  if (section === 'evenements') renderEvenements();
  else if (section === 'secteurs') renderSecteurs();
}

// ─── MODAL ──────────────────────────────────────────────────────────────────
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle   = document.getElementById('modal-title');
const modalBody    = document.getElementById('modal-body');

function openModal(title, bodyHTML) {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
  modalBody.innerHTML = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// ─── DELETE CONFIRM ─────────────────────────────────────────────────────────
const deleteOverlay = document.getElementById('delete-overlay');
let _deleteCallback = null;

function confirmDelete(message, callback) {
  document.getElementById('delete-msg').textContent = message;
  _deleteCallback = callback;
  deleteOverlay.hidden = false;
}

document.getElementById('delete-cancel').addEventListener('click', () => { deleteOverlay.hidden = true; });
deleteOverlay.addEventListener('click', e => { if (e.target === deleteOverlay) deleteOverlay.hidden = true; });
document.getElementById('delete-confirm').addEventListener('click', async () => {
  deleteOverlay.hidden = true;
  if (_deleteCallback) { await _deleteCallback(); _deleteCallback = null; }
});

// ─── BADGE HELPERS ──────────────────────────────────────────────────────────
function statutEvBadge(statut) {
  const map = {
    planifie: ['bg-sky-50 text-sky-700 border-sky-200',       'Planifié'],
    en_cours: ['bg-amber-50 text-amber-700 border-amber-200', 'En cours'],
    termine:  ['bg-slate-100 text-slate-600 border-slate-200','Terminé'],
    annule:   ['bg-red-50 text-red-700 border-red-200',       'Annulé'],
  };
  const [cls, label] = map[statut] ?? ['bg-slate-100 text-slate-500 border-slate-200', statut];
  return `<span class="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${cls}">${label}</span>`;
}

function typeBadge(type) {
  const map = {
    salon: ['bg-violet-50 text-violet-700 border-violet-200', '🎪 Salon'],
    foire: ['bg-amber-50  text-amber-700  border-amber-200',  '🌟 Foire'],
  };
  const [cls, label] = map[type] ?? ['bg-slate-100 text-slate-500 border-slate-200', type];
  return `<span class="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${cls}">${label}</span>`;
}

/** Shared action buttons column */
function actionBtns(entity, id) {
  return `<div class="flex items-center justify-end gap-1">
    <button onclick="showDetails('${entity}',${id})" title="Voir les détails"
      class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition text-base" aria-label="Détails">👁</button>
    <button onclick="openEdit('${entity}',${id})" title="Modifier"
      class="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition text-base" aria-label="Modifier">✏️</button>
    <button onclick="deleteItem('${entity}',${id})" title="Supprimer"
      class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition text-base" aria-label="Supprimer">🗑️</button>
  </div>`;
}

// ─── ÉVÉNEMENTS ─────────────────────────────────────────────────────────────
document.getElementById('ev-add-btn').addEventListener('click', () => showForm('evenements', null));
document.getElementById('ev-search').addEventListener('input', renderEvenements);
document.getElementById('ev-filter-statut').addEventListener('change', renderEvenements);

function renderEvenements() {
  const search = document.getElementById('ev-search').value.trim().toLowerCase();
  const statut = document.getElementById('ev-filter-statut').value;

  const list = state.evenements.filter(ev => {
    const matchText = !search || [ev.titre, ev.lieu, ev.ville].join(' ').toLowerCase().includes(search);
    const matchSt   = !statut || ev.statut === statut;
    return matchText && matchSt;
  });

  document.getElementById('ev-count').textContent = state.evenements.length;
  const tableWrap = document.getElementById('ev-table-wrap');
  const tbody     = document.getElementById('ev-table-body');
  const empty     = document.getElementById('ev-empty');

  if (list.length === 0) {
    tableWrap.classList.add('hidden');
    empty.classList.remove('hidden');
  } else {
    tableWrap.classList.remove('hidden');
    empty.classList.add('hidden');
    tbody.innerHTML = list.map(ev => `
      <tr class="hover:bg-slate-50/60 transition group">
        <td class="px-5 py-3.5">
          <span class="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition">${esc(ev.titre)}</span>
        </td>
        <td class="px-5 py-3.5">${typeBadge(ev.type)}</td>
        <td class="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">${fmtDate(ev.date_debut)} → ${fmtDate(ev.date_fin)}</td>
        <td class="px-5 py-3.5 text-sm text-slate-600">${esc(ev.lieu)}<span class="text-slate-400">, ${esc(ev.ville)}</span></td>
        <td class="px-5 py-3.5">${statutEvBadge(ev.statut)}</td>
        <td class="px-5 py-3.5">${actionBtns('evenements', ev.id)}</td>
      </tr>`).join('');
  }
}

function evFormHTML(ev = null) {
  const v   = f => esc(ev ? (ev[f] ?? '') : '');
  const sel = (f, val) => ev && ev[f] === val ? 'selected' : '';
  return `
    <form id="entity-form" class="space-y-4" novalidate>
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1.5">Titre <span class="text-red-500">*</span></label>
        <input name="titre" value="${v('titre')}" placeholder="Ex : Salon du Digital 2026" maxlength="150"
          class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Type <span class="text-red-500">*</span></label>
          <select name="type" class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
            <option value="salon" ${sel('type','salon')}>🎪 Salon</option>
            <option value="foire" ${sel('type','foire')}>🌟 Foire</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Statut <span class="text-red-500">*</span></label>
          <select name="statut" class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
            <option value="planifie" ${sel('statut','planifie')}>Planifié</option>
            <option value="en_cours" ${sel('statut','en_cours')}>En cours</option>
            <option value="termine"  ${sel('statut','termine')}>Terminé</option>
            <option value="annule"   ${sel('statut','annule')}>Annulé</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Date de début <span class="text-red-500">*</span></label>
          <input name="date_debut" type="date" value="${v('date_debut')}"
            class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Date de fin <span class="text-red-500">*</span></label>
          <input name="date_fin" type="date" value="${v('date_fin')}"
            class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Lieu <span class="text-red-500">*</span></label>
          <input name="lieu" value="${v('lieu')}" placeholder="Ex : Palais des Congrès" maxlength="150"
            class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Ville <span class="text-red-500">*</span></label>
          <input name="ville" value="${v('ville')}" placeholder="Ex : Tanger" maxlength="100"
            class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
        <textarea name="description" rows="3" placeholder="Description de l'événement..."
          class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none">${v('description')}</textarea>
      </div>
      <div class="flex gap-3 pt-1 border-t border-slate-100">
        <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Annuler</button>
        <button type="submit" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold transition shadow-sm">
          ${ev ? 'Enregistrer les modifications' : 'Ajouter l\'événement'}
        </button>
      </div>
    </form>`;
}

function evDetailsHTML(ev) {
  return `
    <div class="space-y-4">
      <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        ${typeBadge(ev.type)} ${statutEvBadge(ev.statut)}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${detailBlock('Titre', esc(ev.titre))}
        ${detailBlock('Dates', `${fmtDate(ev.date_debut)} → ${fmtDate(ev.date_fin)}`)}
        ${detailBlock('Lieu', esc(ev.lieu))}
        ${detailBlock('Ville', esc(ev.ville))}
      </div>
      ${ev.description ? detailBlock('Description', `<p class="text-slate-700 text-sm leading-relaxed">${esc(ev.description)}</p>`) : ''}
    </div>`;
}

// ─── SECTEURS ───────────────────────────────────────────────────────────────
document.getElementById('sec-add-btn').addEventListener('click', () => showForm('secteurs', null));
document.getElementById('sec-search').addEventListener('input', renderSecteurs);

function renderSecteurs() {
  const search = document.getElementById('sec-search').value.trim().toLowerCase();
  const list = state.secteurs.filter(s =>
    !search || s.nom.toLowerCase().includes(search) || (s.description || '').toLowerCase().includes(search)
  );

  document.getElementById('sec-count').textContent = state.secteurs.length;
  const tableWrap = document.getElementById('sec-table-wrap');
  const tbody     = document.getElementById('sec-table-body');
  const empty     = document.getElementById('sec-empty');

  if (list.length === 0) {
    tableWrap.classList.add('hidden');
    empty.classList.remove('hidden');
  } else {
    tableWrap.classList.remove('hidden');
    empty.classList.add('hidden');
    tbody.innerHTML = list.map(sec => `
      <tr class="hover:bg-slate-50/60 transition group">
        <td class="px-5 py-3.5 text-center">
          <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-2xl border border-slate-200/60 group-hover:scale-105 transition-transform">
            ${esc(sec.icone)}
          </span>
        </td>
        <td class="px-5 py-3.5">
          <button onclick="showDetails('secteurs',${sec.id})" class="font-semibold text-slate-800 text-sm hover:text-indigo-700 transition text-left">
            ${esc(sec.nom)}
          </button>
          <div class="text-xs text-slate-400 font-mono">#${sec.id}</div>
        </td>
        <td class="px-5 py-3.5">
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <span class="inline-block w-3.5 h-3.5 rounded-full border border-white shadow-sm" style="background:${esc(sec.couleur)}"></span>
            <span class="font-mono text-xs text-slate-700 font-bold">${esc(sec.couleur)}</span>
          </div>
        </td>
        <td class="px-5 py-3.5 text-sm text-slate-600 max-w-xs">
          <p class="truncate">${esc(sec.description) || '<span class="text-slate-400 italic">Aucune description</span>'}</p>
        </td>
        <td class="px-5 py-3.5">${actionBtns('secteurs', sec.id)}</td>
      </tr>`).join('');
  }
}

function secFormHTML(sec = null) {
  const v = f => esc(sec ? (sec[f] ?? '') : '');
  const couleur = sec?.couleur ?? '#4f46e5';
  return `
    <form id="entity-form" class="space-y-4" novalidate>
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1.5">Nom du secteur <span class="text-red-500">*</span></label>
        <input name="nom" value="${v('nom')}" placeholder="Ex : Agroalimentaire, Artisanat..." maxlength="100"
          class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Icône / Émoji <span class="text-red-500">*</span></label>
          <input name="icone" value="${v('icone')}" placeholder="Ex : 🌾, 🏺, 💻" maxlength="10"
            class="w-full px-3.5 py-2.5 text-sm text-center text-xl border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Couleur <span class="text-red-500">*</span></label>
          <div class="flex items-center gap-2">
            <input type="color" id="couleur-picker" value="${esc(couleur)}"
              oninput="document.querySelector('[name=couleur]').value=this.value; document.getElementById('couleur-hex').textContent=this.value"
              class="h-11 w-14 p-1 border border-slate-300 rounded-xl cursor-pointer bg-white">
            <div>
              <input name="couleur" value="${esc(couleur)}" placeholder="#4f46e5" maxlength="7"
                oninput="try{document.getElementById('couleur-picker').value=this.value}catch(e){}"
                class="w-full px-2 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition">
              <span id="couleur-hex" class="text-xs text-slate-400 ml-1">${esc(couleur)}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1.5">Description <span class="text-red-500">*</span></label>
        <textarea name="description" rows="3" placeholder="Décrivez les activités principales de ce secteur..." maxlength="1000"
          class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none">${v('description')}</textarea>
      </div>
      <div class="flex gap-3 pt-1 border-t border-slate-100">
        <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Annuler</button>
        <button type="submit" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold transition shadow-sm">
          ${sec ? 'Enregistrer les modifications' : 'Ajouter le secteur'}
        </button>
      </div>
    </form>`;
}

function secDetailsHTML(sec) {
  return `
    <div class="space-y-5">
      <div class="flex items-center gap-4 pb-4 border-b border-slate-100">
        <span class="text-5xl p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          ${esc(sec.icone)}
        </span>
        <div>
          <h3 class="font-bold text-slate-900 text-xl">${esc(sec.nom)}</h3>
          <p class="text-xs text-slate-400 font-mono mt-0.5">Identifiant : #${sec.id}</p>
        </div>
      </div>
      <div>
        <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Couleur associée</span>
        <div class="flex items-center gap-2.5">
          <span class="inline-block w-7 h-7 rounded-xl border border-slate-200 shadow-sm" style="background:${esc(sec.couleur)}"></span>
          <code class="font-mono text-slate-700 font-semibold text-sm">${esc(sec.couleur)}</code>
        </div>
      </div>
      <div>
        <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</span>
        <p class="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm">${esc(sec.description) || '<span class="italic text-slate-400">Aucune description</span>'}</p>
      </div>
    </div>`;
}

// ─── GENERIC CRUD ACTIONS ────────────────────────────────────────────────────

const ENTITY_LABELS = {
  evenements: { singular: 'événement', article: 'cet', title: 'Événement' },
  secteurs:   { singular: 'secteur',   article: 'ce',   title: 'Secteur'   },
};

function showForm(entity, item) {
  const label = ENTITY_LABELS[entity];
  const title = item
    ? `Modifier le ${label.singular}`
    : `Ajouter un ${label.singular}`;
  const html = entity === 'evenements' ? evFormHTML(item) : secFormHTML(item);
  openModal(title, html);

  document.getElementById('entity-form').addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const btn = e.target.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Enregistrement...';
    try {
      if (item) {
        await apiFetch(`${API[entity]}?id=${item.id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast(`${label.title} modifié avec succès.`, 'success');
      } else {
        await apiFetch(API[entity], { method: 'POST', body: JSON.stringify(data) });
        showToast(`${label.title} ajouté avec succès.`, 'success');
      }
      closeModal();
      await loadSection(entity);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = item ? 'Enregistrer les modifications' : `Ajouter le ${label.singular}`;
    }
  });
}

async function showDetails(entity, id) {
  try {
    const item = await apiFetch(`${API[entity]}?id=${id}`);
    const label = ENTITY_LABELS[entity];
    const html  = entity === 'evenements' ? evDetailsHTML(item) : secDetailsHTML(item);
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
    `Êtes-vous sûr de vouloir supprimer ${label.article} ${label.singular} ? Cette action est irréversible.`,
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

// ─── DETAIL BLOCK HELPER ────────────────────────────────────────────────────
function detailBlock(label, valueHTML) {
  return `
    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
      <span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">${label}</span>
      <div class="text-sm font-semibold text-slate-800">${valueHTML || '—'}</div>
    </div>`;
}

// ─── INIT ────────────────────────────────────────────────────────────────────
navigateTo('evenements');
