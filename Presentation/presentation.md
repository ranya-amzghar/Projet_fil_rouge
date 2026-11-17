---
marp: true
theme: default
size: 16:9
paginate: true
style: |
  section {
    font-family: "Aptos", "Segoe UI", sans-serif;
    background: linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%);
    color: #172033;
    padding: 48px 64px;
    border-radius: 18px;
    box-shadow: inset 0 0 0 1px rgba(36, 59, 107, 0.08);
  }
  section:not(.title-slide) {
    background: linear-gradient(180deg, #ffffff 0%, #f3f7ff 100%);
  }
  h1, h2 {
    color: #243b6b;
    letter-spacing: 0.01em;
  }
  h1 {
    font-size: 2.3em;
    margin-bottom: 0.4em;
  }
  h2 {
    font-size: 1.8em;
    margin-bottom: 0.7em;
    padding-bottom: 0.2em;
    border-bottom: 2px solid rgba(36, 59, 107, 0.15);
  }
  p, li {
    font-size: 1.12em;
    line-height: 1.6;
  }
  ul {
    padding-left: 1.5em;
  }
  li + li {
    margin-top: 0.38em;
  }
  strong {
    color: #1d4ed8;
  }
  section.title-slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 32px 48px 40px;
    background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
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
    border-radius: 12px;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  }
  section.design-slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 28px 48px 22px;
    background: #eef0eb;
  }
  section.design-slide h2 {
    margin: 0 0 18px;
    padding: 0;
    border: 0;
    font-size: 2.25em;
    line-height: 1.2;
    color: #243b6b;
    text-align: center;
  }
  section.design-slide .design-card {
    width: min(92%, 980px);
    background: rgba(223, 232, 200, 0.82);
    border-radius: 14px;
    padding: 18px 22px 14px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: inset 0 0 0 1px rgba(25, 34, 45, 0.08);
  }
  section.design-slide .design-card img {
    display: block;
    width: 100%;
    max-width: 100%;
    max-height: 62vh;
    object-fit: contain;
    border-radius: 0;
    box-shadow: none;
  }
---

<!-- _class: title-slide -->

# Rapport de projet e-learning platforme

<div class="brand-row">
  <img src="ofppt.png" alt="Logo OFPPT" />
  <img src="solicode.png" alt="Logo SOLICODE" />
</div>

Ranya Amzghar  
encadrant : Fouad ES-SARAJ

---

## Remerciements

---

## Introduction

---

## Contexte du projet

---

<!-- _class: image-only -->

## Method: Scrum

![Méthode Scrum](../Rapport/rapport/M%C3%A9thodologie%20Scrum/scrum.png)

---
<!-- _class: image-only -->

## Processus 2TUP

![Processus 2TUP](../Rapport/rapport/Processus%202TUP/images.jpg)

---
<!-- _class: design-slide -->

## Design Thinking

<div class="design-card">
  <img src="../Rapport/rapport/Design%20Thinking/design_thinking.jpg" alt="Design Thinking" />
</div>

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

## Réalisation

---

## Démonstration