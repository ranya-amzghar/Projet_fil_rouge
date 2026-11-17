# 🚀 Commandes de Lancement des Projets (PFE)

Ce document récapitule toutes les commandes nécessaires pour lancer les 4 projets :
1. **Salons_Foires** (Application unifiée Événements & Secteurs)
2. **Session1** (Application PHP MVC avec MySQL)
3. **Session2** (Application Secteurs d'activité API JSON)
4. **Session_3** (Application Secteurs d'activité Architecture OOP / JSON)

---

## 📌 Prérequis
- **PHP 8.x** installé et accessible dans votre terminal (`php -v`).
- **MySQL / MariaDB** (via XAMPP, WAMP ou service local) pour **Session1**.

---

## 1️⃣ Salons_Foires (Application Principale)

Application moderne avec stockage JSON (sans base MySQL requise), comprenant les **Événements** et les **Secteurs d'activité**.

### Commande de lancement (PowerShell / CMD) :
```powershell
cd "c:\Users\Solicode\Desktop\pfe\Salons_Foires"
php -S localhost:8000
```

### URL d'accès dans le navigateur :
👉 **[http://localhost:8000/frontend/index.html](http://localhost:8000/frontend/index.html)**

---

## 2️⃣ Session1 (Salons & Foires avec MySQL)

Application PHP classique / MVC connectée à une base de données MySQL.

### Étape préalable (Base de données MySQL) :
1. Démarrez votre serveur MySQL (ex: Panneau XAMPP).
2. Importez le fichier SQL si ce n'est pas déjà fait :
   - Fichier : `Session1/salons-foires/database/schema.sql`
   - Vérifiez les identifiants dans `Session1/salons-foires/config/database.php` (`DB_USER`, `DB_PASS`).

### Commande de lancement (PowerShell / CMD) :
> *Important : On lance le serveur depuis le dossier `Session1` car le code utilise la constante `BASE_URL = '/salons-foires'`.*

```powershell
cd "c:\Users\Solicode\Desktop\pfe\Session1"
php -S localhost:8001
```

### URL d'accès dans le navigateur :
👉 **[http://localhost:8001/salons-foires/index.php](http://localhost:8001/salons-foires/index.php)**  
*(Redirige automatiquement vers `/salons-foires/evenements/index.php`)*

---

## 3️⃣ Session2 (Secteurs d'activité - API & JSON)

Application frontend statique Tailwind communiquant avec une API PHP et un fichier JSON (`backend/database/secteurs.json`).

### Commande de lancement (PowerShell / CMD) :
```powershell
cd "c:\Users\Solicode\Desktop\pfe\Session2\réalisation\secteurs-activite"
php -S localhost:8002
```

### URL d'accès dans le navigateur :
👉 **[http://localhost:8002/frontend/index.html](http://localhost:8002/frontend/index.html)**

---

## 4️⃣ Session_3 (Secteurs d'activité - Architecture OOP)

Application frontend responsive Tailwind avec backend PHP orienté objet (Controller, Service, DAO, Request) et stockage JSON (`backend/database/secteur_data.json`).

### Commande de lancement (PowerShell / CMD) :
```powershell
cd "c:\Users\Solicode\Desktop\pfe\Session_3"
php -S localhost:8003
```

### URL d'accès dans le navigateur :
👉 **[http://localhost:8003/frontend/index.html](http://localhost:8003/frontend/index.html)**

---

## 🌐 Option Tout-en-un (Un seul serveur depuis la racine `pfe`)

Vous pouvez également lancer un seul serveur PHP depuis la racine du dossier `pfe` :

```powershell
cd "c:\Users\Solicode\Desktop\pfe"
php -S localhost:8000
```

### Accès aux applications via ce serveur unique :
- **Salons_Foires** : [http://localhost:8000/Salons_Foires/frontend/index.html](http://localhost:8000/Salons_Foires/frontend/index.html)
- **Session_3** : [http://localhost:8000/Session_3/frontend/index.html](http://localhost:8000/Session_3/frontend/index.html)
- **Session2** : [http://localhost:8000/Session2/réalisation/secteurs-activite/frontend/index.html](http://localhost:8000/Session2/réalisation/secteurs-activite/frontend/index.html)
- **Session1** : [http://localhost:8000/Session1/salons-foires/index.php](http://localhost:8000/Session1/salons-foires/index.php) *(nécessite MySQL)*

---

## ⚡ Tableau récapitulatif

| Projet | Port recommandé | Commande rapide | URL d'accès |
|---|---|---|---|
| **Salons_Foires** | `8000` | `cd Salons_Foires; php -S localhost:8000` | [localhost:8000/frontend/index.html](http://localhost:8000/frontend/index.html) |
| **Session1** | `8001` | `cd Session1; php -S localhost:8001` | [localhost:8001/salons-foires/index.php](http://localhost:8001/salons-foires/index.php) |
| **Session2** | `8002` | `cd "Session2\réalisation\secteurs-activite"; php -S localhost:8002` | [localhost:8002/frontend/index.html](http://localhost:8002/frontend/index.html) |
| **Session_3** | `8003` | `cd Session_3; php -S localhost:8003` | [localhost:8003/frontend/index.html](http://localhost:8003/frontend/index.html) |

