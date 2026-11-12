/**
 * Logique d'interface : rendu de la liste et gestion des modales (ajout, modification, détails, suppression).
 */
document.addEventListener('DOMContentLoaded', () => {
  const tableBody    = document.getElementById('table-body');
  const emptyState   = document.getElementById('empty-state');
  const countLabel   = document.getElementById('count-label');
  const alertBox     = document.getElementById('alert-box');

  const formModal    = document.getElementById('form-modal');
  const formTitle    = document.getElementById('form-title');
  const secteurForm  = document.getElementById('secteur-form');
  const inputId      = document.getElementById('secteur-id');
  const inputNom     = document.getElementById('nom');
  const inputDesc    = document.getElementById('description');
  const errorNom     = document.getElementById('error-nom');
  const errorDesc    = document.getElementById('error-description');
  const btnSubmit    = document.getElementById('btn-submit');

  const detailsModal = document.getElementById('details-modal');
  const detailsNom   = document.getElementById('details-nom');
  const detailsId    = document.getElementById('details-id');
  const detailsDesc  = document.getElementById('details-description');

  const confirmModal = document.getElementById('confirm-modal');

  let pendingDeleteId = null;

  /* ---------- Rendu de la liste ---------- */

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
  }

  function renderRow(secteur) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/70 transition-colors';
    tr.innerHTML = `
      <td class="px-5 py-3.5">
        <button type="button" class="row-details font-semibold text-slate-900 hover:text-blue-600 transition text-left flex items-center gap-2.5" data-id="${secteur.id}">
          <span class="w-7 h-7 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-xs font-mono font-medium">#${secteur.id}</span>
          <span class="text-xs sm:text-sm font-semibold">${escapeHtml(secteur.nom)}</span>
        </button>
      </td>
      <td class="px-5 py-3.5 text-slate-600 text-xs sm:text-sm max-w-xs md:max-w-md truncate">
        ${escapeHtml(secteur.description) || '<span class="italic text-slate-400">Aucune description</span>'}
      </td>
      <td class="px-5 py-3.5 text-right whitespace-nowrap">
        <div class="flex items-center justify-end gap-1">
          <button type="button" class="row-details p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition" title="Détails" data-id="${secteur.id}">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button type="button" class="row-edit p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Modifier" data-id="${secteur.id}">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button type="button" class="row-delete p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition" title="Supprimer" data-id="${secteur.id}">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;
    return tr;
  }

  async function loadSecteurs() {
    try {
      const secteurs = await SecteurApi.list();

      tableBody.innerHTML = '';
      countLabel.textContent = `${secteurs.length} secteur${secteurs.length > 1 ? 's' : ''}`;

      if (secteurs.length === 0) {
        emptyState.classList.remove('hidden');
        tableBody.closest('.overflow-hidden').classList.add('hidden');
        return;
      }

      emptyState.classList.add('hidden');
      tableBody.closest('.overflow-hidden').classList.remove('hidden');
      secteurs.forEach((secteur) => tableBody.appendChild(renderRow(secteur)));
    } catch (err) {
      showAlert('error', "Impossible de charger les secteurs : " + err.message);
    }
  }

  /* ---------- Alertes ---------- */

  function showAlert(type, message) {
    const isSuccess = type === 'success';
    const icon = isSuccess
      ? '<svg class="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg class="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

    alertBox.innerHTML = `
      <div class="shrink-0">${icon}</div>
      <span class="flex-1">${escapeHtml(message)}</span>
      <button onclick="this.parentElement.classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-sm leading-none ml-1">&times;</button>
    `;
    alertBox.className = 'mb-6 rounded-xl border px-4 py-3 text-xs sm:text-sm font-medium shadow-subtle transition-all duration-200 flex items-center gap-2.5 ' +
      (isSuccess
        ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800'
        : 'bg-rose-50/70 border-rose-200/80 text-rose-800');
    alertBox.classList.remove('hidden');
    window.clearTimeout(showAlert._timer);
    showAlert._timer = window.setTimeout(() => alertBox.classList.add('hidden'), 4000);
  }

  /* ---------- Modale formulaire (ajout / modification) ---------- */

  function clearFormErrors() {
    [errorNom, errorDesc].forEach((el) => { el.classList.add('hidden'); el.textContent = ''; });
    [inputNom, inputDesc].forEach((el) => el.classList.remove('border-rose-400', 'ring-2', 'ring-rose-100'));
  }

  function showFormErrors(errors) {
    clearFormErrors();
    if (errors.nom) {
      errorNom.textContent = errors.nom;
      errorNom.classList.remove('hidden');
      inputNom.classList.add('border-rose-400', 'ring-2', 'ring-rose-100');
    }
    if (errors.description) {
      errorDesc.textContent = errors.description;
      errorDesc.classList.remove('hidden');
      inputDesc.classList.add('border-rose-400', 'ring-2', 'ring-rose-100');
    }
  }

  function openCreateModal() {
    inputId.value = '';
    inputNom.value = '';
    inputDesc.value = '';
    clearFormErrors();
    formTitle.textContent = 'Nouveau secteur';
    btnSubmit.textContent = 'Ajouter';
    formModal.classList.remove('hidden');
    inputNom.focus();
  }

  async function openEditModal(id) {
    try {
      const secteur = await SecteurApi.get(id);
      inputId.value = secteur.id;
      inputNom.value = secteur.nom;
      inputDesc.value = secteur.description || '';
      clearFormErrors();
      formTitle.textContent = 'Modifier le secteur';
      btnSubmit.textContent = 'Enregistrer';
      formModal.classList.remove('hidden');
      inputNom.focus();
    } catch (err) {
      showAlert('error', err.message);
    }
  }

  function closeFormModal() {
    formModal.classList.add('hidden');
  }

  secteurForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors();

    const payload = { nom: inputNom.value.trim(), description: inputDesc.value.trim() };
    const id = inputId.value;

    btnSubmit.disabled = true;
    try {
      if (id) {
        await SecteurApi.update(id, payload);
        showAlert('success', `Le secteur « ${payload.nom} » a été modifié.`);
      } else {
        await SecteurApi.create(payload);
        showAlert('success', `Le secteur « ${payload.nom} » a été ajouté.`);
      }
      closeFormModal();
      loadSecteurs();
    } catch (err) {
      if (err.status === 422) {
        showFormErrors(err.errors);
      } else {
        showAlert('error', err.message);
      }
    } finally {
      btnSubmit.disabled = false;
    }
  });

  /* ---------- Modale détails ---------- */

  async function openDetailsModal(id) {
    try {
      const secteur = await SecteurApi.get(id);
      detailsNom.textContent = secteur.nom;
      detailsId.textContent = `Identifiant système : #${secteur.id}`;
      detailsDesc.textContent = secteur.description || 'Aucune description fournie pour ce secteur.';
      detailsModal.classList.remove('hidden');
    } catch (err) {
      showAlert('error', err.message);
    }
  }

  /* ---------- Modale suppression ---------- */

  function openConfirmModal(id) {
    pendingDeleteId = id;
    confirmModal.classList.remove('hidden');
  }

  function closeConfirmModal() {
    pendingDeleteId = null;
    confirmModal.classList.add('hidden');
  }

  document.getElementById('btn-confirm-delete').addEventListener('click', async () => {
    if (pendingDeleteId === null) return;
    try {
      await SecteurApi.remove(pendingDeleteId);
      showAlert('success', 'Le secteur a été supprimé.');
      closeConfirmModal();
      loadSecteurs();
    } catch (err) {
      showAlert('error', err.message);
      closeConfirmModal();
    }
  });

  /* ---------- Écouteurs globaux ---------- */

  document.getElementById('btn-add').addEventListener('click', openCreateModal);
  const emptyAddBtn = document.querySelector('.btn-add-empty');
  if (emptyAddBtn) emptyAddBtn.addEventListener('click', openCreateModal);

  document.getElementById('btn-cancel').addEventListener('click', closeFormModal);
  document.getElementById('btn-close-details').addEventListener('click', () => detailsModal.classList.add('hidden'));
  document.getElementById('btn-cancel-delete').addEventListener('click', closeConfirmModal);

  const closeBtns = document.querySelectorAll('.btn-close-modal');
  closeBtns.forEach((b) => b.addEventListener('click', closeFormModal));

  tableBody.addEventListener('click', (event) => {
    const editBtn = event.target.closest('.row-edit');
    const deleteBtn = event.target.closest('.row-delete');
    const detailsBtn = event.target.closest('.row-details');

    if (editBtn) openEditModal(editBtn.dataset.id);
    else if (deleteBtn) openConfirmModal(deleteBtn.dataset.id);
    else if (detailsBtn) openDetailsModal(detailsBtn.dataset.id);
  });

  [formModal, detailsModal, confirmModal].forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.classList.add('hidden');
    });
  });

  loadSecteurs();
});
