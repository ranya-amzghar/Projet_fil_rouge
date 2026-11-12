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
    tr.className = 'hover:bg-slate-50/80 transition duration-150';
    tr.innerHTML = `
      <td class="px-5 py-4 font-semibold text-slate-900">
        <button type="button" class="row-details hover:text-indigo-600 font-bold transition text-left flex items-center gap-2.5" data-id="${secteur.id}">
          <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">#${secteur.id}</span>
          <span>${escapeHtml(secteur.nom)}</span>
        </button>
      </td>
      <td class="px-5 py-4 text-slate-600 text-sm max-w-xs md:max-w-md truncate">
        ${escapeHtml(secteur.description) || '<span class="text-slate-300 italic font-normal">Aucune description</span>'}
      </td>
      <td class="px-5 py-4 text-right whitespace-nowrap">
        <div class="flex items-center justify-end gap-1.5">
          <button type="button" class="row-details text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition" data-id="${secteur.id}">
            Détails
          </button>
          <button type="button" class="row-edit text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition" data-id="${secteur.id}">
            Modifier
          </button>
          <button type="button" class="row-delete text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition" data-id="${secteur.id}">
            Supprimer
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
      countLabel.textContent = `${secteurs.length} secteur${secteurs.length > 1 ? 's' : ''} répertorié${secteurs.length > 1 ? 's' : ''}`;

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
    alertBox.innerHTML = `
      <span class="text-lg leading-none">${isSuccess ? '✓' : '⚠️'}</span>
      <span>${escapeHtml(message)}</span>
    `;
    alertBox.className = 'mb-6 rounded-xl border px-4 py-3.5 text-sm font-medium shadow-sm transition-all duration-200 flex items-center gap-3 ' +
      (isSuccess
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-red-50 border-red-200 text-red-800');
    alertBox.classList.remove('hidden');
    window.clearTimeout(showAlert._timer);
    showAlert._timer = window.setTimeout(() => alertBox.classList.add('hidden'), 4000);
  }

  /* ---------- Modale formulaire (ajout / modification) ---------- */

  function clearFormErrors() {
    [errorNom, errorDesc].forEach((el) => { el.classList.add('hidden'); el.textContent = ''; });
    [inputNom, inputDesc].forEach((el) => el.classList.remove('border-red-500', 'ring-2', 'ring-red-200'));
  }

  function showFormErrors(errors) {
    clearFormErrors();
    if (errors.nom) {
      errorNom.textContent = errors.nom;
      errorNom.classList.remove('hidden');
      inputNom.classList.add('border-red-500', 'ring-2', 'ring-red-200');
    }
    if (errors.description) {
      errorDesc.textContent = errors.description;
      errorDesc.classList.remove('hidden');
      inputDesc.classList.add('border-red-500', 'ring-2', 'ring-red-200');
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
