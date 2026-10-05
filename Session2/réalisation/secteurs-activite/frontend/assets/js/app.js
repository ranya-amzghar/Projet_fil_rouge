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
    tr.className = 'hover:bg-slate-50';
    tr.innerHTML = `
      <td class="px-4 py-3 font-semibold">
        <button class="row-details hover:text-brand hover:underline text-left" data-id="${secteur.id}">
          ${escapeHtml(secteur.nom)}
        </button>
      </td>
      <td class="px-4 py-3 text-slate-600 max-w-xs truncate">${escapeHtml(secteur.description) || '<span class="text-slate-400">—</span>'}</td>
      <td class="px-4 py-3">
        <div class="flex justify-end gap-2">
          <button class="row-edit text-sm font-semibold text-slate-600 hover:text-brand px-2 py-1 rounded-md hover:bg-slate-100" data-id="${secteur.id}">Modifier</button>
          <button class="row-delete text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 px-2 py-1 rounded-md transition" data-id="${secteur.id}">Supprimer</button>
        </div>
      </td>
    `;
    return tr;
  }

  async function loadSecteurs() {
    try {
      const secteurs = await SecteurApi.list();

      tableBody.innerHTML = '';
      countLabel.textContent = `${secteurs.length} secteur${secteurs.length > 1 ? 's' : ''} d'activité`;

      if (secteurs.length === 0) {
        emptyState.classList.remove('hidden');
        tableBody.closest('.overflow-x-auto').classList.add('hidden');
        return;
      }

      emptyState.classList.add('hidden');
      tableBody.closest('.overflow-x-auto').classList.remove('hidden');
      secteurs.forEach((secteur) => tableBody.appendChild(renderRow(secteur)));
    } catch (err) {
      showAlert('error', "Impossible de charger les secteurs : " + err.message);
    }
  }

  /* ---------- Alertes ---------- */

  function showAlert(type, message) {
    alertBox.textContent = message;
    alertBox.className = 'mb-4 rounded-lg border px-4 py-3 text-sm ' +
      (type === 'success'
        ? 'bg-green-50 border-green-200 text-green-700'
        : 'bg-red-50 border-red-200 text-red-700');
    alertBox.classList.remove('hidden');
    window.clearTimeout(showAlert._timer);
    showAlert._timer = window.setTimeout(() => alertBox.classList.add('hidden'), 4000);
  }

  /* ---------- Modale formulaire (ajout / modification) ---------- */

  function clearFormErrors() {
    [errorNom, errorDesc].forEach((el) => { el.classList.add('hidden'); el.textContent = ''; });
    [inputNom, inputDesc].forEach((el) => el.classList.remove('border-red-500'));
  }

  function showFormErrors(errors) {
    clearFormErrors();
    if (errors.nom) {
      errorNom.textContent = errors.nom;
      errorNom.classList.remove('hidden');
      inputNom.classList.add('border-red-500');
    }
    if (errors.description) {
      errorDesc.textContent = errors.description;
      errorDesc.classList.remove('hidden');
      inputDesc.classList.add('border-red-500');
    }
  }

  function openCreateModal() {
    inputId.value = '';
    inputNom.value = '';
    inputDesc.value = '';
    clearFormErrors();
    formTitle.textContent = 'Ajouter un secteur';
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
      detailsId.textContent = `Secteur #${secteur.id}`;
      detailsDesc.textContent = secteur.description || 'Aucune description.';
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
  document.querySelector('.btn-add-empty').addEventListener('click', openCreateModal);
  document.getElementById('btn-cancel').addEventListener('click', closeFormModal);
  document.getElementById('btn-close-details').addEventListener('click', () => detailsModal.classList.add('hidden'));
  document.getElementById('btn-cancel-delete').addEventListener('click', closeConfirmModal);

  tableBody.addEventListener('click', (event) => {
    const editBtn = event.target.closest('.row-edit');
    const deleteBtn = event.target.closest('.row-delete');
    const detailsBtn = event.target.closest('.row-details');

    if (editBtn) openEditModal(editBtn.dataset.id);
    if (deleteBtn) openConfirmModal(deleteBtn.dataset.id);
    if (detailsBtn) openDetailsModal(detailsBtn.dataset.id);
  });

  [formModal, detailsModal, confirmModal].forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.classList.add('hidden');
    });
  });

  loadSecteurs();
});
