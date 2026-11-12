const API = '../backend/api/api.php';

document.addEventListener('DOMContentLoaded', () => {
    const showForm = document.getElementById('showForm');
    const form = document.getElementById('form');
    const formTitle = document.getElementById('formTitle');
    const secteurId = document.getElementById('secteurId');
    const nom = document.getElementById('nom');
    const icone = document.getElementById('icone');
    const couleur = document.getElementById('couleur');
    const couleurHex = document.getElementById('couleurHex');
    const description = document.getElementById('description');
    const ajouter = document.getElementById('ajouter');
    const annuler = document.getElementById('annuler');
    
    const tableBody = document.getElementById('table_body');
    const dataContainer = document.getElementById('data-container');
    const emptyState = document.getElementById('empty-state');
    const badgeCount = document.getElementById('badge-count');
    const searchInput = document.getElementById('search-input');

    const modal = document.getElementById('detailsModal');
    const fermerDetails = document.getElementById('fermerDetails');

    let allSecteurs = [];

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }

    function setLoading(isLoading) {
        ajouter.disabled = isLoading;
        ajouter.textContent = isLoading ? 'Enregistrement...' : 'Enregistrer';
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        const isSuccess = type === 'success';
        const icon = isSuccess ? '✓' : '⚠️';
        const bgStyle = isSuccess
            ? 'background:#1a2a1a;color:#3fb950;border:1px solid #2ea043'
            : 'background:#2a1a1a;color:#f85149;border:1px solid #da3633';

        toast.setAttribute('style', bgStyle + ';border-radius:12px');
        toast.className = `pointer-events-auto px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-all transform duration-200`;
        toast.innerHTML = `<span class="text-base font-bold">${icon}</span><span>${escapeHtml(message)}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-2');
            setTimeout(() => toast.remove(), 250);
        }, 4000);
    }

    async function request(url, options = {}) {
        const response = await fetch(url, options);
        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Réponse invalide du serveur.');
        }

        if (!response.ok) {
            throw new Error(data.message || 'Erreur serveur.');
        }
        return data;
    }

    function openForm(mode, secteur = null) {
        form.hidden = false;
        showForm.hidden = true;
        if (mode === 'edit' && secteur) {
            formTitle.textContent = "Modifier le secteur d'activité";
            secteurId.value = secteur.id;
            nom.value = secteur.nom;
            icone.value = secteur.icone;
            couleur.value = secteur.couleur;
            if (couleurHex) couleurHex.textContent = secteur.couleur;
            description.value = secteur.description;
        } else {
            formTitle.textContent = 'Nouveau secteur';
            form.reset();
            secteurId.value = '';
            couleur.value = '#58a6ff';
            if (couleurHex) couleurHex.textContent = '#58a6ff';
        }
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        nom.focus();
    }

    function closeForm() {
        form.hidden = true;
        showForm.hidden = false;
        form.reset();
        secteurId.value = '';
    }

    if (couleur && couleurHex) {
        couleur.addEventListener('input', (e) => {
            couleurHex.textContent = e.target.value;
        });
    }

    /* ---------- Rendu du Tableau — Carbon Dark Pro ---------- */

    function renderSecteurs(secteurs) {
        const count = secteurs.length;
        badgeCount.textContent = `${count} secteur${count > 1 ? 's' : ''}`;

        if (count === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        let tableHtml = '';
        secteurs.forEach((s) => {
            tableHtml += `
                <tr class="transition-colors cursor-default">
                    <!-- Icône -->
                    <td class="py-4 pl-6 pr-3 text-center align-middle w-16">
                        <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#1c2128] text-2xl border border-[#30363d] shadow-xs group-hover:scale-105 transition-transform">
                            ${escapeHtml(s.icone)}
                        </span>
                    </td>

                    <!-- Nom -->
                    <td class="px-4 py-4 align-middle whitespace-nowrap">
                        <button type="button" data-action="details" data-id="${s.id}" class="text-sm font-bold text-[#e6edf3] hover:text-[#58a6ff] transition-colors text-left block">
                            ${escapeHtml(s.nom)}
                        </button>
                        <span class="text-xs text-[#8b949e] font-mono font-medium">#${s.id}</span>
                    </td>

                    <!-- Couleur -->
                    <td class="px-4 py-4 align-middle whitespace-nowrap">
                        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1c2128] border border-[#30363d]">
                            <span class="inline-block w-3.5 h-3.5 rounded-full border border-[#30363d]" style="background:${escapeHtml(s.couleur)}"></span>
                            <span class="font-mono text-xs text-[#e6edf3] font-bold">${escapeHtml(s.couleur)}</span>
                        </div>
                    </td>

                    <!-- Description -->
                    <td class="px-4 py-4 align-middle text-sm text-[#8b949e] min-w-[260px]">
                        <p class="leading-relaxed break-words m-0 text-[#8b949e] text-sm">
                            ${escapeHtml(s.description) || '<span class="text-[#8b949e] italic font-normal">Aucune description</span>'}
                        </p>
                    </td>

                    <!-- Actions -->
                    <td class="py-4 pl-3 pr-6 text-right align-middle whitespace-nowrap">
                        <div class="inline-flex items-center justify-end gap-1.5">
                            <button data-action="details" data-id="${s.id}" type="button" 
                                class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1c2128] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                                title="Consulter les détails">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                <span>Détails</span>
                            </button>
                            <button data-action="edit" data-id="${s.id}" type="button" 
                                class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1c2a1c] hover:bg-[#2ea043] text-[#3fb950] hover:text-white transition-colors"
                                title="Modifier ce secteur">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                <span>Modifier</span>
                            </button>
                            <button data-action="delete" data-id="${s.id}" type="button" 
                                class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2a1a1a] hover:bg-[#da3633] text-[#f85149] hover:text-white transition-colors"
                                title="Supprimer ce secteur">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                <span>Supprimer</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = tableHtml;
    }

    async function chargerSecteurs() {
        try {
            allSecteurs = await request(API);
            appliquerFiltre();
        } catch (error) {
            showToast('Erreur : ' + error.message, 'error');
            console.error(error);
        }
    }

    function appliquerFiltre() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (!query) {
            renderSecteurs(allSecteurs);
            return;
        }

        const filtered = allSecteurs.filter((s) => {
            const nom = (s.nom || '').toLowerCase();
            const desc = (s.description || '').toLowerCase();
            const color = (s.couleur || '').toLowerCase();
            return nom.includes(query) || desc.includes(query) || color.includes(query);
        });

        renderSecteurs(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener('input', appliquerFiltre);
    }

    async function consulterSecteur(id) {
        try {
            const s = await request(`${API}?id=${id}`);
            document.getElementById('d_id').textContent = s.id;
            document.getElementById('d_nom').textContent = s.nom;
            document.getElementById('d_icone').textContent = s.icone;
            document.getElementById('d_couleur').textContent = s.couleur;
            document.getElementById('d_couleur_box').style.background = s.couleur;
            document.getElementById('d_description').textContent = s.description;
            modal.hidden = false;
        } catch (error) {
            showToast('Erreur : ' + error.message, 'error');
        }
    }

    async function modifierSecteur(id) {
        try {
            const s = await request(`${API}?id=${id}`);
            openForm('edit', s);
        } catch (error) {
            showToast('Erreur : ' + error.message, 'error');
        }
    }

    async function supprimerSecteur(id) {
        if (!confirm("Voulez-vous vraiment supprimer ce secteur d'activité ?")) {
            return;
        }
        try {
            const result = await request(`${API}?id=${id}`, { method: 'DELETE' });
            showToast(result.message, 'success');
            chargerSecteurs();
        } catch (error) {
            showToast('Erreur : ' + error.message, 'error');
        }
    }

    // Gestion centralisée des clics sur le tableau
    dataContainer.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-action]');
        if (!btn) return;
        const { action, id } = btn.dataset;
        if (action === 'details') consulterSecteur(id);
        if (action === 'edit') modifierSecteur(id);
        if (action === 'delete') supprimerSecteur(id);
    });

    showForm.addEventListener('click', () => openForm('add'));
    annuler.addEventListener('click', closeForm);
    fermerDetails.addEventListener('click', () => { modal.hidden = true; });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.hidden = true;
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setLoading(true);

        const payload = {
            nom: nom.value.trim(),
            icone: icone.value.trim(),
            couleur: couleur.value.trim(),
            description: description.value.trim(),
        };
        const id = secteurId.value;

        try {
            const result = await request(id ? `${API}?id=${id}` : API, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            showToast(result.message, 'success');
            closeForm();
            chargerSecteurs();
        } catch (error) {
            showToast('Erreur : ' + error.message, 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    });

    chargerSecteurs();
});
