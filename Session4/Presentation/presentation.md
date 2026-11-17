---
marp: true
theme: default
size: 16:9
paginate: true
style: |
  section {
    font-family: "Aptos", "Segoe UI", sans-serif;
    background: #f8fafc;
    color: #172033;
    padding: 48px 64px;
  }
  h1, h2 {
    color: #243b6b;
  }
  h1 {
    font-size: 2.4em;
  }
  h2 {
    font-size: 1.8em;
    margin-bottom: 0.7em;
  }
  ul {
    font-size: 1.25em;
    line-height: 1.65;
  }
  section.title-slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 32px 48px 40px;
  }
  section.title-slide .brand-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 28px;
    width: 100%;
    margin: 8px 0 18px;
  }
  section.title-slide .brand-row img {
    max-height: 88px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 3px 8px rgba(36, 59, 107, 0.12));
  }
  section.image-only {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
  }
  section.image-only img {
    max-width: 96%;
    max-height: 78%;
    object-fit: contain;
  }
---

<!-- _class: title-slide -->

# Rapport de projet e-learning platforme

<div class="brand-row">
  <img src="ofppt.png" alt="Logo OFPPT" />
  <img src="solicode.png" alt="Logo SOLICODE" />
</div>

Aymane salmoune  
encadrant : Fouad ESSARAJ

---

## Remerciements

---

## Introduction

---

## Contexte du projet

---

## Objectif de formation (Solicode)

---

## Cahier des charges

---
<!-- _class: image-only -->

## Scrum

![Méthode Scrum](../rapport/SCRUM/scrum.png)

---
<!-- _class: image-only -->

## Processus 2TUP

![Processus 2TUP](../rapport/2TUP/images.jpg)

---
<!-- _class: image-only -->

## Design Thinking

![Design Thinking](../rapport/design_thinking/design_thinking.jpg)

---

## Planification

---

## Branche fonctionnelle

---

## Carte d'empathie

---

## Définition du problème

---

## Idéation

---

## Diagramme de cas d'utilisation

---

## Stack technologique

- **Backend** · PHP 8.2 · Laravel 12
- **Autorisations** · Spatie Laravel Permission
- **Mobile** · NativePHP
- **Frontend** · Blade · Tailwind CSS · Alpine · Preline · Vite
- **Base de données** · MySQL
- **Diagrammes** · Mermaid · PlantUML

---

## Architecture

**Présentation** → **Logique métier** → **Accès aux données**

Navigateur · HTML / JavaScript

↓ API HTTP / JSON

PHP · Services · DAO

↓

Fichier JSON

---

## Prototype musical

- Genres · Artistes · Morceaux
- Création · Consultation · Modification · Suppression
- Statut · Brouillon ou publié
- Couvertures · Fichiers audio

---

## Relations des données

- **Artiste** → plusieurs morceaux
- **Genre** → plusieurs morceaux
- **Morceau** → un artiste + un genre

---

## Structure technique

- **Frontend** · HTML · CSS / Tailwind · JavaScript
- **Backend** · PHP · Contrôleurs · Services · DAO
- **API** · REST
- **Données** · MySQL / MariaDB · prototype JSON

---

## Diagramme de classes

---

## Maquettes

---

## Interfaces

---

## Conclusion

- Prototype CRUD fonctionnel
- Base pour une plateforme musicale évolutive
- Extensions possibles · authentification · upload audio · gestion complète
