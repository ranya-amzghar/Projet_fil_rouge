/**
 * Salons & Foires — Console d'Administration
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
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

// ─── TOAST ──────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  const borderColors = {
    success: 'border-emerald-200 bg-white text-slate-800',
    error:   'border-rose-200 bg-white text-slate-800',
    info:    'border-sky-200 bg-white text-slate-800',
  };

  const icons = {
    success: '<svg class="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error:   '<svg class="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    info:    '<svg class="w-4 h-4 text-sky-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
  };

  toast.className = `pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${borderColors[type] || borderColors.info} shadow-elevated text-xs sm:text-sm font-medium toast-enter`;
  toast.innerHTML = `
    <div class="pt-0.5">${icons[type] || icons.info}</div>
    <div class="flex-1 leading-snug">${esc(message)}</div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 text-sm leading-none ml-1">&times;</button>
  `;

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
    const el = document.getElementById(`section-${s}`);
    if (el) el.hidden = s !== section;
  });

  document.querySelectorAll('.nav-tab').forEach(btn => {
    const active = btn.dataset.nav === section;
    btn.classList.toggle('active', active);
    if (!active) {
      btn.classList.remove('bg-slate-900', 'text-white');
      btn.classList.add('text-slate-600');
    }
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
    planifie: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      dot: 'bg-emerald-500',
      label: 'Planifié'
    },
    en_cours: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      dot: 'bg-amber-500',
      label: 'En cours'
    },
    termine: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      label: 'Terminé'
    },
    annule: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
      dot: 'bg-rose-500',
      label: 'Annulé'
    },
  };
  const cfg = map[statut] ?? { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: statut };
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}"><span class="w-1.5 h-1.5 rounded-full ${cfg.dot}"></span>${cfg.label}</span>`;
}

function typeBadge(type) {
  const isSalon = type === 'salon';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${isSalon ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-purple-50 text-purple-700 border border-purple-200/60'}">${isSalon ? 'Salon' : 'Foire'}</span>`;
}

/** Action buttons column with minimalist SVG icons */
function actionBtns(entity, id) {
  return `<div class="flex items-center justify-end gap-1">
    <button onclick="showDetails('${entity}',${id})" title="Voir les détails"
      class="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition" aria-label="Détails">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
    <button onclick="openEdit('${entity}',${id})" title="Modifier"
      class="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition" aria-label="Modifier">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
    </button>
    <button onclick="deleteItem('${entity}',${id})" title="Supprimer"
      class="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition" aria-label="Supprimer">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
    </button>
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
      <tr class="hover:bg-slate-50/70 transition-colors">
        <td class="px-5 py-3.5">
          <span class="font-semibold text-slate-900">${esc(ev.titre)}</span>
        </td>
        <td class="px-5 py-3.5">${typeBadge(ev.type)}</td>
        <td class="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">${fmtDate(ev.date_debut)} → ${fmtDate(ev.date_fin)}</td>
        <td class="px-5 py-3.5 text-xs text-slate-600">${esc(ev.lieu)}<span class="text-slate-400">, ${esc(ev.ville)}</span></td>
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
        <label class="block text-xs font-semibold text-slate-700 mb-1">Titre de l'événement <span class="text-rose-500">*</span></label>
        <input name="titre" value="${v('titre')}" placeholder="Ex : Salon International des Technologies" maxlength="150" required
          class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Type <span class="text-rose-500">*</span></label>
          <select name="type" class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
            <option value="salon" ${sel('type','salon')}>Salon</option>
            <option value="foire" ${sel('type','foire')}>Foire</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Statut <span class="text-rose-500">*</span></label>
          <select name="statut" class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
            <option value="planifie" ${sel('statut','planifie')}>Planifié</option>
            <option value="en_cours" ${sel('statut','en_cours')}>En cours</option>
            <option value="termine"  ${sel('statut','termine')}>Terminé</option>
            <option value="annule"   ${sel('statut','annule')}>Annulé</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Date de début <span class="text-rose-500">*</span></label>
          <input name="date_debut" type="date" value="${v('date_debut')}" required
            class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Date de fin <span class="text-rose-500">*</span></label>
          <input name="date_fin" type="date" value="${v('date_fin')}" required
            class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Lieu <span class="text-rose-500">*</span></label>
          <input name="lieu" value="${v('lieu')}" placeholder="Ex : Palais des Expositions" maxlength="150" required
            class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Ville <span class="text-rose-500">*</span></label>
          <input name="ville" value="${v('ville')}" placeholder="Ex : Casablanca" maxlength="100" required
            class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Description</label>
        <textarea name="description" rows="3" placeholder="Informations complémentaires sur l'événement..."
          class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition resize-none">${v('description')}</textarea>
      </div>
      <div class="flex gap-2.5 pt-3 border-t border-slate-200">
        <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Annuler</button>
        <button type="submit" class="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition">
          ${ev ? 'Enregistrer les modifications' : 'Créer l\'événement'}
        </button>
      </div>
    </form>`;
}

function evDetailsHTML(ev) {
  return `
    <div class="space-y-4">
      <div class="flex items-center gap-2 pb-3 border-b border-slate-200">
        ${typeBadge(ev.type)} ${statutEvBadge(ev.statut)}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${detailBlock('Titre', esc(ev.titre))}
        ${detailBlock('Dates', `${fmtDate(ev.date_debut)} → ${fmtDate(ev.date_fin)}`)}
        ${detailBlock('Lieu', esc(ev.lieu))}
        ${detailBlock('Ville', esc(ev.ville))}
      </div>
      ${ev.description ? detailBlock('Description', `<p class="text-slate-600 text-xs sm:text-sm leading-relaxed">${esc(ev.description)}</p>`) : ''}
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
      <tr class="hover:bg-slate-50/70 transition-colors">
        <td class="px-5 py-3.5 text-center">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-base border border-slate-200">
            ${esc(sec.icone || '🏷️')}
          </span>
        </td>
        <td class="px-5 py-3.5">
          <button onclick="showDetails('secteurs',${sec.id})" class="font-semibold text-slate-900 text-xs sm:text-sm hover:text-blue-600 transition text-left">
            ${esc(sec.nom)}
          </button>
          <div class="text-[11px] text-slate-400 font-mono">ID: #${sec.id}</div>
        </td>
        <td class="px-5 py-3.5">
          <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
            <span class="inline-block w-3 h-3 rounded-full border border-white shadow-xs" style="background:${esc(sec.couleur)}"></span>
            <span class="font-mono text-[11px] text-slate-600 font-bold">${esc(sec.couleur)}</span>
          </div>
        </td>
        <td class="px-5 py-3.5 text-xs text-slate-600 max-w-xs">
          <p class="truncate">${esc(sec.description) || '<span class="text-slate-400 italic">Aucune description</span>'}</p>
        </td>
        <td class="px-5 py-3.5">${actionBtns('secteurs', sec.id)}</td>
      </tr>`).join('');
  }
}

function secFormHTML(sec = null) {
  const v = f => esc(sec ? (sec[f] ?? '') : '');
  const couleur = sec?.couleur ?? '#2563eb';
  return `
    <form id="entity-form" class="space-y-4" novalidate>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Nom du secteur <span class="text-rose-500">*</span></label>
        <input name="nom" value="${v('nom')}" placeholder="Ex : Agroalimentaire, Technologie..." maxlength="100" required
          class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Icône / Émoji <span class="text-rose-500">*</span></label>
          <input name="icone" value="${v('icone')}" placeholder="Ex : 💻" maxlength="10" required
            class="w-full px-3 py-2 text-xs sm:text-sm text-center border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Couleur <span class="text-rose-500">*</span></label>
          <div class="flex items-center gap-2">
            <input type="color" id="couleur-picker" value="${esc(couleur)}"
              oninput="document.querySelector('[name=couleur]').value=this.value; document.getElementById('couleur-hex').textContent=this.value"
              class="h-9 w-10 p-0.5 border border-slate-200 rounded-lg cursor-pointer bg-white">
            <div class="flex-1">
              <input name="couleur" value="${esc(couleur)}" placeholder="#2563eb" maxlength="7" required
                oninput="try{document.getElementById('couleur-picker').value=this.value; document.getElementById('couleur-hex').textContent=this.value}catch(e){}"
                class="w-full px-2 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition">
            </div>
          </div>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Description <span class="text-rose-500">*</span></label>
        <textarea name="description" rows="3" placeholder="Description des activités du secteur..." maxlength="1000" required
          class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-subtle transition resize-none">${v('description')}</textarea>
      </div>
      <div class="flex gap-2.5 pt-3 border-t border-slate-200">
        <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Annuler</button>
        <button type="submit" class="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition">
          ${sec ? 'Enregistrer les modifications' : 'Ajouter le secteur'}
        </button>
      </div>
    </form>`;
}

function secDetailsHTML(sec) {
  return `
    <div class="space-y-4">
      <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
        <span class="text-3xl p-2 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
          ${esc(sec.icone || '🏷️')}
        </span>
        <div>
          <h3 class="font-bold text-slate-900 text-base">${esc(sec.nom)}</h3>
          <p class="text-[11px] text-slate-400 font-mono">Identifiant : #${sec.id}</p>
        </div>
      </div>
      <div>
        <span class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Couleur associée</span>
        <div class="flex items-center gap-2">
          <span class="inline-block w-5 h-5 rounded-md border border-slate-200 shadow-xs" style="background:${esc(sec.couleur)}"></span>
          <code class="font-mono text-slate-700 font-semibold text-xs">${esc(sec.couleur)}</code>
        </div>
      </div>
      <div>
        <span class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</span>
        <p class="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs sm:text-sm leading-relaxed">${esc(sec.description) || '<span class="italic text-slate-400">Aucune description</span>'}</p>
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
    <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
      <span class="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">${label}</span>
      <div class="text-xs sm:text-sm font-semibold text-slate-800">${valueHTML || '—'}</div>
    </div>`;
}

// ─── INIT ────────────────────────────────────────────────────────────────────
navigateTo('evenements');
