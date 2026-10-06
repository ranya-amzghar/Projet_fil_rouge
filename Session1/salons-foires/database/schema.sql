CREATE DATABASE IF NOT EXISTS salons_foires
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE salons_foires;

CREATE TABLE IF NOT EXISTS secteur_activite (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exposant (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  raison_sociale VARCHAR(150) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  telephone      VARCHAR(30) NULL,
  site_web       VARCHAR(255) NULL,
  secteur_id     INT UNSIGNED NOT NULL,
  CONSTRAINT fk_exposant_secteur FOREIGN KEY (secteur_id)
    REFERENCES secteur_activite(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evenement (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titre       VARCHAR(150) NOT NULL,
  type        ENUM('salon','foire') NOT NULL DEFAULT 'salon',
  description TEXT NULL,
  date_debut  DATE NOT NULL,
  date_fin    DATE NOT NULL,
  lieu        VARCHAR(150) NOT NULL,
  ville       VARCHAR(100) NOT NULL,
  statut      ENUM('planifie','en_cours','termine','annule') NOT NULL DEFAULT 'planifie',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_evenement_dates CHECK (date_fin >= date_debut)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stand (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero       VARCHAR(20) NOT NULL,
  superficie   DECIMAL(7,2) NULL,
  prix         DECIMAL(10,2) NULL,
  statut       ENUM('disponible','reserve','occupe') NOT NULL DEFAULT 'disponible',
  evenement_id INT UNSIGNED NOT NULL,
  exposant_id  INT UNSIGNED NULL,
  UNIQUE KEY uq_stand_evenement_numero (evenement_id, numero),
  CONSTRAINT fk_stand_evenement FOREIGN KEY (evenement_id)
    REFERENCES evenement(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_stand_exposant FOREIGN KEY (exposant_id)
    REFERENCES exposant(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Données de démonstration
INSERT INTO secteur_activite (nom) VALUES
  ('Agroalimentaire'), ('Artisanat'), ('Technologies & Digital'), ('Automobile'), ('Immobilier');

INSERT INTO exposant (raison_sociale, email, telephone, secteur_id) VALUES
  ('Atlas Gourmet', 'contact@atlasgourmet.ma', '0539000001', 1),
  ('Tanger Digital', 'info@tangerdigital.ma', '0539000002', 3);

INSERT INTO evenement (titre, type, description, date_debut, date_fin, lieu, ville, statut) VALUES
  ('Salon International de l''Artisanat', 'salon', 'Rencontre annuelle des artisans et des acheteurs professionnels.', '2026-11-12', '2026-11-15', 'Palais des Congrès', 'Tanger', 'planifie'),
  ('Foire Régionale de l''Agroalimentaire', 'foire', 'Producteurs locaux, coopératives et distributeurs.', '2026-10-02', '2026-10-05', 'Parc des Expositions', 'Tétouan', 'planifie'),
  ('Salon du Digital', 'salon', 'Agences, startups et solutions numériques.', '2026-05-20', '2026-05-22', 'Technopark', 'Tanger', 'termine');

INSERT INTO stand (numero, superficie, prix, statut, evenement_id, exposant_id) VALUES
  ('A1', 12.00, 4500.00, 'occupe', 2, 1),
  ('A2', 9.00, 3500.00, 'disponible', 2, NULL),
  ('B1', 15.00, 6000.00, 'occupe', 3, 2);
