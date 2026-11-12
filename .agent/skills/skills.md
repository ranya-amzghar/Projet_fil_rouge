---
name: php-json-crud-module
description: Generates a complete CRUD module (list, create, update, delete, details) for one entity using a layered PHP backend (Model, Manager, Controller, REST api.php) with JSON-file storage and a vanilla JS + Tailwind frontend. Use when the user asks for a CRUD, a management page or an API for an entity such as secteur d'activité, événement, exposant or stand in the "Application de Salons et Foires" project, or says "same as the sections code but with full CRUD".
---

# PHP + JSON CRUD Module Generator

Produce a working, production-ready CRUD module for ONE entity. Deliver complete files, not snippets. Do not add optional extras (auth, pagination, search, frameworks) unless the user asks.

## Inputs to determine

1. **Entity** (singular and plural, French), e.g. `Secteur` / `secteurs` for "secteur d'activité".
2. **Fields**: name, type (text, color, textarea, number, date, select), required or not.
3. If the user does not list fields, use these defaults for `Secteur d'activité`: `nom`, `icone`, `couleur` (hex), `description`.

Ask a question only if the entity itself is unclear. Otherwise pick sensible defaults and state them in one line after delivering.

## Required operations (all five, always)

| Operation | HTTP | URL | Success code |
|---|---|---|---|
| Afficher la liste | GET | `api.php` | 200 |
| Consulter les détails | GET | `api.php?id=N` | 200 (404 if missing) |
| Ajouter | POST | `api.php` (JSON body) | 201 |
| Modifier | PUT | `api.php?id=N` (JSON body) | 200 (404 if missing) |
| Supprimer | DELETE | `api.php?id=N` | 200 (404 if missing) |

## File structure

```
projet/
├── backend/
│   ├── api/api.php
│   ├── controllers/<Entity>Controller (controller.php)
│   ├── classes/<entity>.php            (model)
│   ├── classes/<Entity>Manager.php     (data access)
│   └── database/<entity>_data.json     (initial content: [])
└── frontend/
    ├── index.html
    └── script.js
```

Keep the same layering as the user's original sections code: `api.php` routes, the controller handles HTTP logic and validation, the manager reads and writes the JSON file, the model represents one record.

## Backend rules

**Model**
- Private properties, a constructor taking ALL fields (including `id`), typed getters that `return` their value, and a `toArray()` method.

**Manager**
- Path built with `__DIR__ . '/../database/<entity>_data.json'`.
- Private `read()` (returns `[]` if the file is missing or invalid) and `write()` (`JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT`, `LOCK_EX`, `array_values` to reindex).
- Private `nextId()` = max existing id + 1.
- Public `getAll()`, `getById(int)`, `add(array)`, `update(int, array)`, `delete(int): bool`. Missing records return `null` or `false`.

**Controller**
- A private `respond($data, $code)` that sets the status code and `Content-Type: application/json; charset=utf-8`.
- A `validate()` that checks every required field is present and non-empty, plus format rules (hex color `/^#[0-9a-fA-F]{6}$/`, numeric, date, etc.), and returns an error message in French or `null`.
- A `clean()` that `trim`s every value and keeps only the known fields.
- One public method per operation, returning 400 on validation errors and 404 when the id does not exist.

**api.php**
- Header written EXACTLY `Content-Type: application/json; charset=utf-8` (no space before the colon).
- `require_once`, read `$_SERVER['REQUEST_METHOD']`, `$id = isset($_GET['id']) ? (int) $_GET['id'] : null`, decode `php://input`.
- `switch` on the method: GET (list or details), POST, PUT (id required), DELETE (id required), default 405.
- Wrap everything in `try/catch (Throwable)` and return a 500 with a generic message (never leak the exception text).

## Frontend rules

- One `index.html` with Tailwind (CDN): a title, an "Ajouter" button, a hidden form (used for both add and edit, with a hidden `id` input), a table with an Actions column (Détails, Modifier, Supprimer), a details modal, and a toast container.
- One `script.js` using `fetch` with `async/await` and a reusable `request(url, options)` helper that throws `Error(data.message)` when `!response.ok`.
- `escapeHtml()` on EVERY value injected through `insertAdjacentHTML`.
- Event delegation on the table body using `button[data-action]` and `data-id`.
- Add and edit share the form: empty hidden id means POST, filled hidden id means PUT to `?id=`.
- Details use `GET ?id=` and fill the modal with `textContent`.
- Delete asks `confirm()` first, then calls DELETE and refreshes the list.
- Loading state on the submit button, success and error toasts, empty-state row ("Aucun ...") when the list is empty.
- Constant `const API = '../backend/api/api.php';` at the top.

## Reference implementation (entity: Secteur d'activité)

Adapt names and fields for other entities.

### backend/classes/secteur.php
```php
<?php
class Secteur {
    private $id;
    private $nom;
    private $icone;
    private $couleur;
    private $description;

    public function __construct($id, $nom, $icone, $couleur, $description) {
        $this->id = $id;
        $this->nom = $nom;
        $this->icone = $icone;
        $this->couleur = $couleur;
        $this->description = $description;
    }

    public function getId() { return $this->id; }
    public function getNom(): string { return $this->nom; }
    public function getIcone(): string { return $this->icone; }
    public function getCouleur(): string { return $this->couleur; }
    public function getDescription(): string { return $this->description; }

    public function toArray(): array {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'icone' => $this->icone,
            'couleur' => $this->couleur,
            'description' => $this->description
        ];
    }
}
?>
```

### backend/classes/SecteurManager.php
```php
<?php
require_once 'secteur.php';

class SecteurManager {
    private $file;

    public function __construct() {
        $this->file = __DIR__ . '/../database/secteur_data.json';
    }

    private function read(): array {
        if (!file_exists($this->file)) {
            return [];
        }
        $data = json_decode(file_get_contents($this->file), true);
        return is_array($data) ? $data : [];
    }

    private function write(array $secteurs): void {
        file_put_contents(
            $this->file,
            json_encode(array_values($secteurs), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
            LOCK_EX
        );
    }

    private function nextId(array $secteurs): int {
        $max = 0;
        foreach ($secteurs as $s) {
            if (isset($s['id']) && $s['id'] > $max) {
                $max = $s['id'];
            }
        }
        return $max + 1;
    }

    public function getAll(): array {
        return $this->read();
    }

    public function getById(int $id) {
        foreach ($this->read() as $s) {
            if ($s['id'] === $id) {
                return $s;
            }
        }
        return null;
    }

    public function add(array $data): array {
        $secteurs = $this->read();
        $secteur = new Secteur($this->nextId($secteurs), $data['nom'], $data['icone'], $data['couleur'], $data['description']);
        $secteurs[] = $secteur->toArray();
        $this->write($secteurs);
        return $secteur->toArray();
    }

    public function update(int $id, array $data) {
        $secteurs = $this->read();
        foreach ($secteurs as $i => $s) {
            if ($s['id'] === $id) {
                $secteur = new Secteur($id, $data['nom'], $data['icone'], $data['couleur'], $data['description']);
                $secteurs[$i] = $secteur->toArray();
                $this->write($secteurs);
                return $secteur->toArray();
            }
        }
        return null;
    }

    public function delete(int $id): bool {
        $secteurs = $this->read();
        foreach ($secteurs as $i => $s) {
            if ($s['id'] === $id) {
                unset($secteurs[$i]);
                $this->write($secteurs);
                return true;
            }
        }
        return false;
    }
}
?>
```

### backend/controllers/controller.php
```php
<?php
require_once __DIR__ . '/../classes/SecteurManager.php';

class SecteurController {
    private $manager;

    public function __construct() {
        $this->manager = new SecteurManager();
    }

    private function respond($data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    private function validate($data): ?string {
        if (!is_array($data)) {
            return 'Données invalides.';
        }
        foreach (['nom', 'icone', 'couleur', 'description'] as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                return "Le champ '$field' est obligatoire.";
            }
        }
        if (!preg_match('/^#[0-9a-fA-F]{6}$/', $data['couleur'])) {
            return 'La couleur doit être au format hexadécimal (#RRGGBB).';
        }
        return null;
    }

    private function clean(array $data): array {
        return [
            'nom' => trim($data['nom']),
            'icone' => trim($data['icone']),
            'couleur' => trim($data['couleur']),
            'description' => trim($data['description'])
        ];
    }

    public function gettingSecteurs() {
        $this->respond($this->manager->getAll());
    }

    public function gettingSecteur(int $id) {
        $secteur = $this->manager->getById($id);
        if ($secteur === null) {
            $this->respond(['message' => 'Secteur introuvable.'], 404);
            return;
        }
        $this->respond($secteur);
    }

    public function addingSecteur($data) {
        $error = $this->validate($data);
        if ($error) {
            $this->respond(['message' => $error], 400);
            return;
        }
        $secteur = $this->manager->add($this->clean($data));
        $this->respond(['message' => "Secteur d'activité ajouté avec succès", 'secteur' => $secteur], 201);
    }

    public function updatingSecteur(int $id, $data) {
        $error = $this->validate($data);
        if ($error) {
            $this->respond(['message' => $error], 400);
            return;
        }
        $secteur = $this->manager->update($id, $this->clean($data));
        if ($secteur === null) {
            $this->respond(['message' => 'Secteur introuvable.'], 404);
            return;
        }
        $this->respond(['message' => "Secteur d'activité modifié avec succès", 'secteur' => $secteur]);
    }

    public function deletingSecteur(int $id) {
        if (!$this->manager->delete($id)) {
            $this->respond(['message' => 'Secteur introuvable.'], 404);
            return;
        }
        $this->respond(['message' => "Secteur d'activité supprimé avec succès"]);
    }
}
?>
```

### backend/api/api.php
```php
<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../controllers/controller.php';

$controller = new SecteurController();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

try {
    $data = json_decode(file_get_contents('php://input'), true);

    switch ($method) {
        case 'GET':
            if ($id) {
                $controller->gettingSecteur($id);
            } else {
                $controller->gettingSecteurs();
            }
            break;

        case 'POST':
            $controller->addingSecteur($data);
            break;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['message' => 'Identifiant manquant.']);
                break;
            }
            $controller->updatingSecteur($id, $data);
            break;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['message' => 'Identifiant manquant.']);
                break;
            }
            $controller->deletingSecteur($id);
            break;

        default:
            http_response_code(405);
            echo json_encode(['message' => 'Méthode non autorisée.']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur.']);
}
?>
```

### backend/database/secteur_data.json
```json
[]
```

### frontend/index.html
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secteurs d'activité</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-6">
    <div id="toast-container" class="fixed top-4 right-4 z-50"></div>

    <div class="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Secteurs d'activité</h1>
            <button id="showForm" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Ajouter un secteur</button>
        </div>

        <form id="form" hidden class="mb-6 p-4 border border-gray-300 rounded-lg grid gap-3 md:grid-cols-2">
            <h2 id="formTitle" class="md:col-span-2 text-lg font-semibold">Nouveau secteur</h2>
            <input type="hidden" id="secteurId">
            <input type="text" id="nom" placeholder="Nom" required class="border border-gray-400 rounded px-3 py-2">
            <input type="text" id="icone" placeholder="Icône (ex : 🏭)" required class="border border-gray-400 rounded px-3 py-2">
            <div class="flex items-center gap-3">
                <label for="couleur">Couleur</label>
                <input type="color" id="couleur" value="#1e5cae" class="h-10 w-16">
            </div>
            <textarea id="description" placeholder="Description" required rows="2" class="md:col-span-2 border border-gray-400 rounded px-3 py-2"></textarea>
            <div class="md:col-span-2 flex gap-2">
                <button type="submit" id="ajouter" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Enregistrer</button>
                <button type="button" id="annuler" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Annuler</button>
            </div>
        </form>

        <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-500">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="border border-gray-500 px-4 py-2 text-left">Nom</th>
                        <th class="border border-gray-500 px-4 py-2 text-left">Icône</th>
                        <th class="border border-gray-500 px-4 py-2 text-left">Couleur</th>
                        <th class="border border-gray-500 px-4 py-2 text-left">Description</th>
                        <th class="border border-gray-500 px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody id="table_body"></tbody>
            </table>
        </div>
    </div>

    <div id="detailsModal" hidden class="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <div class="flex items-center gap-3 mb-4">
                <span id="d_icone" class="text-4xl"></span>
                <h2 id="d_nom" class="text-xl font-bold"></h2>
            </div>
            <p class="mb-2"><strong>ID :</strong> <span id="d_id"></span></p>
            <p class="mb-2 flex items-center gap-2"><strong>Couleur :</strong>
                <span id="d_couleur_box" class="inline-block w-6 h-6 rounded border"></span>
                <span id="d_couleur"></span>
            </p>
            <p class="mb-4"><strong>Description :</strong> <span id="d_description"></span></p>
            <button id="fermerDetails" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Fermer</button>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

### frontend/script.js
```js
const API = '../backend/api/api.php';

document.addEventListener('DOMContentLoaded', () => {
    const showForm = document.getElementById('showForm');
    const form = document.getElementById('form');
    const formTitle = document.getElementById('formTitle');
    const secteurId = document.getElementById('secteurId');
    const nom = document.getElementById('nom');
    const icone = document.getElementById('icone');
    const couleur = document.getElementById('couleur');
    const description = document.getElementById('description');
    const ajouter = document.getElementById('ajouter');
    const annuler = document.getElementById('annuler');
    const table = document.getElementById('table_body');
    const modal = document.getElementById('detailsModal');
    const fermerDetails = document.getElementById('fermerDetails');

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
        toast.className = 'text-white p-4 mb-2 rounded-lg shadow-lg ' + (type === 'success' ? 'bg-green-600' : 'bg-red-600');
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    async function request(url, options = {}) {
        const response = await fetch(url, options);
        const data = await response.json();
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
            description.value = secteur.description;
        } else {
            formTitle.textContent = 'Nouveau secteur';
            form.reset();
            secteurId.value = '';
        }
    }

    function closeForm() {
        form.hidden = true;
        showForm.hidden = false;
        form.reset();
        secteurId.value = '';
    }

    async function afficherSecteurs() {
        try {
            const secteurs = await request(API);
            table.innerHTML = '';
            if (secteurs.length === 0) {
                table.innerHTML = `<tr><td colspan="5" class="border border-gray-500 px-4 py-2 text-center">Aucun secteur d'activité.</td></tr>`;
                return;
            }
            secteurs.forEach(s => {
                table.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td class="border border-gray-500 px-4 py-2 md:px-3">${escapeHtml(s.nom)}</td>
                        <td class="border border-gray-500 px-4 py-2 md:px-3">${escapeHtml(s.icone)}</td>
                        <td class="border border-gray-500 px-4 py-2 md:px-3">
                            <span class="inline-block w-4 h-4 rounded align-middle mr-2" style="background:${escapeHtml(s.couleur)}"></span>${escapeHtml(s.couleur)}
                        </td>
                        <td class="border border-gray-500 px-4 py-2 md:px-3">${escapeHtml(s.description)}</td>
                        <td class="border border-gray-500 px-4 py-2 md:px-3 whitespace-nowrap">
                            <button data-action="details" data-id="${s.id}" class="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700">Détails</button>
                            <button data-action="edit" data-id="${s.id}" class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Modifier</button>
                            <button data-action="delete" data-id="${s.id}" class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Supprimer</button>
                        </td>
                    </tr>`);
            });
        } catch (error) {
            showToast('Erreur : ' + error.message, 'error');
            console.error(error);
        }
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
            openForm('edit', await request(`${API}?id=${id}`));
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
            afficherSecteurs();
        } catch (error) {
            showToast('Erreur : ' + error.message, 'error');
        }
    }

    table.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-action]');
        if (!btn) return;
        const { action, id } = btn.dataset;
        if (action === 'details') consulterSecteur(id);
        if (action === 'edit') modifierSecteur(id);
        if (action === 'delete') supprimerSecteur(id);
    });

    showForm.addEventListener('click', () => openForm('add'));
    annuler.addEventListener('click', closeForm);
    fermerDetails.addEventListener('click', () => (modal.hidden = true));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setLoading(true);
        const payload = { nom: nom.value, icone: icone.value, couleur: couleur.value, description: description.value };
        const id = secteurId.value;
        try {
            const result = await request(id ? `${API}?id=${id}` : API, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showToast(result.message, 'success');
            closeForm();
            afficherSecteurs();
        } catch (error) {
            showToast('Erreur : ' + error.message, 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    });

    afficherSecteurs();
});
```

## Bugs to never reproduce

- Constructor without parameters or using undefined variables (`$nom`, `$icone` not passed in).
- Getters without `return`.
- Copy-paste errors such as `$this->couleur = $nom`.
- Header written `'Content-Type : application/json'` (space before the colon).
- Injecting user data into HTML without `escapeHtml()`.
- Relative paths for the JSON file (use `__DIR__`).
- Returning HTTP 200 for errors, or leaking exception messages.

## Adapting to other entities of the project

Keep the same pattern and change only names, fields, validation and table columns:
- **Événement**: `titre`, `date_debut`, `date_fin`, `lieu`, `description` (validate dates and `date_fin >= date_debut`).
- **Exposant**: `nom`, `email` (validate with `FILTER_VALIDATE_EMAIL`), `telephone`, `secteur_id`.
- **Stand**: `numero`, `surface` (numeric), `evenement_id`, `exposant_id`.

For foreign keys (`secteur_id`, `evenement_id`), render a `<select>` filled by a fetch on the related API, and show the related name in the list.

When the project later moves from JSON to MySQL, only the Manager changes (PDO with prepared statements); Model, Controller, API contract and frontend stay identical.

## Pre-delivery checklist

1. All five operations work end to end (list, details, add, edit, delete).
2. Status codes: 200, 201, 400, 404, 405, 500 used correctly.
3. Validation runs server-side, not only in the form.
4. Every output injected into the DOM is escaped.
5. File paths, includes and the `API` constant are consistent with the folder structure.
6. `database/` is writable by PHP (state this in one line to the user).
7. All files delivered in full, with no placeholders or "..." left in the code.