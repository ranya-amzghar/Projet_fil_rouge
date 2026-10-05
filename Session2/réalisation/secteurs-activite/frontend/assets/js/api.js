/**
 * Client HTTP pour l'API des secteurs d'activité.
 * Adapter API_BASE_URL selon l'emplacement du backend (ex: "/secteurs-activite/backend/api/secteurs.php").
 */
const API_BASE_URL = '../backend/api/secteurs.php';

async function parseResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch (e) {
    throw new Error("Réponse invalide du serveur.");
  }

  if (!response.ok || body.success === false) {
    const error = new Error(body.message || "Une erreur est survenue.");
    error.errors = body.errors || {};
    error.status = response.status;
    throw error;
  }

  return body.data;
}

const SecteurApi = {
  list() {
    return fetch(API_BASE_URL).then(parseResponse);
  },

  get(id) {
    return fetch(`${API_BASE_URL}?id=${id}`).then(parseResponse);
  },

  create(payload) {
    return fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(parseResponse);
  },

  update(id, payload) {
    return fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(parseResponse);
  },

  remove(id) {
    return fetch(`${API_BASE_URL}?id=${id}`, { method: 'DELETE' }).then(parseResponse);
  },
};
