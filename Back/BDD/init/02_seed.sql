-- FORCE L'ENCODAGE UTF-8 POUR L'IMPORT (C'est la ligne magique)
SET NAMES 'utf8mb4';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. Roles
-- ============================================================
INSERT INTO Roles (id, name) VALUES 
(1, 'Pratiquant'), 
(2, 'Sauveteur');

-- ============================================================
-- 2. Utilisateurs
-- ============================================================
INSERT INTO Utilisateurs (id, nom, prenom, sexe, date_naissance, password, id_roles, email, groupe_sanguin, pathologies, traitements) VALUES
  (1, 'Dupont', 'Jean', TRUE, '1995-02-20', 'skieur123', 1, 'jean.dupont@email.com', 'A+', 'Asthme', 'Ventoline'),
  (2, 'Martin', 'Paul', TRUE, '1982-08-11', 'sauveteur123', 2, 'paul.martin@station.com', 'O+', NULL, NULL),
  (3, 'Val', 'Valentin', TRUE, '2000-01-01', 'val', 1, 'val.val@email.com', 'B-', 'Diabète type 1', 'Insuline'),
  (4, 'Durand', 'Sophie', FALSE, '1998-05-15', 'sophie123', 1, 'sophie.d@email.com', 'AB+', NULL, NULL);

-- ============================================================
-- 3. Equipements (Liste enrichie)
-- ============================================================
INSERT INTO Equipements (id, name, link) VALUES
  (1, 'DVA (Détecteur Victime Avalanche)', 'http://exemple.com/dva.png'),
  (2, 'Sac Airbag', 'http://exemple.com/airbag.png'),
  (3, 'Skis Alpin', 'http://exemple.com/ski.png'),
  (4, 'Snowboard', 'http://exemple.com/snowboard.png'),
  (5, 'Pelle à neige', 'http://exemple.com/pelle.png'),
  (6, 'Sonde de recherche', 'http://exemple.com/sonde.png'),
  (7, 'Casque connecté', 'http://exemple.com/casque.png'),
  (8, 'Masque réalité augmentée', 'http://exemple.com/masque.png'),
  (9, 'Bâtons connectés', 'http://exemple.com/batons.png'),
  (10, 'Montre GPS SkiOx', 'http://exemple.com/montre.png');

-- ============================================================
-- 4. Stations (Liste complète avec coordonnées)
-- ============================================================
INSERT INTO Stations (id, nom, localisation, latitude, longitude) VALUES 
(1, 'Isola 2000', 'Alpes-Maritimes', 44.1865, 7.1565),
(2, 'Val Thorens', 'Savoie', 45.2971, 6.5796),
(3, 'Tignes', 'Savoie', 45.4681, 6.9755),
(4, 'Les Arcs', 'Savoie', 45.5724, 6.7290),
(5, 'La Plagne', 'Savoie', 45.5071, 6.7012),
(6, 'Alpe d’Huez', 'Isère', 45.0908, 6.0667),
(7, 'Serre Chevalier', 'Hautes-Alpes', 44.8963, 6.6020),
(8, 'Les Deux Alpes', 'Isère', 45.0083, 6.1257),
(9, 'Avoriaz', 'Haute-Savoie', 46.1840, 6.7760),
(10, 'La Clusaz', 'Haute-Savoie', 45.8995, 6.4246);

-- ============================================================
-- 5. equipement_station (Disponibilité par station)
-- ============================================================
-- Isola 2000 (Focus sécurité et base)
INSERT INTO equipement_station (id_station, id_equipements) VALUES
  (1, 1), -- DVA
  (1, 2), -- Airbag
  (1, 3), -- Ski
  (1, 5), -- Pelle
  (1, 6); -- Sonde

-- Val Thorens (Tout équipé, station high-tech)
INSERT INTO equipement_station (id_station, id_equipements) VALUES
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 10);

-- Tignes (Sportif)
INSERT INTO equipement_station (id_station, id_equipements) VALUES
  (3, 3), (3, 4), (3, 7), (3, 9);

-- Les Arcs & La Plagne (Classique)
INSERT INTO equipement_station (id_station, id_equipements) VALUES
  (4, 1), (4, 3), (4, 7),
  (5, 1), (5, 3), (5, 4);

-- Alpe d'Huez
INSERT INTO equipement_station (id_station, id_equipements) VALUES (6, 1), (6, 2), (6, 3), (6, 10);

-- Serre Chevalier
INSERT INTO equipement_station (id_station, id_equipements) VALUES (7, 3), (7, 4), (7, 9);

-- Les Deux Alpes
INSERT INTO equipement_station (id_station, id_equipements) VALUES (8, 1), (8, 2), (8, 3), (8, 4), (8, 7);

-- Avoriaz (Snowboard focus)
INSERT INTO equipement_station (id_station, id_equipements) VALUES (9, 4), (9, 7), (9, 8);

-- La Clusaz
INSERT INTO equipement_station (id_station, id_equipements) VALUES (10, 3), (10, 5), (10, 6);


-- ============================================================
-- 6. User_equipement (Matériel personnel des utilisateurs)
-- ============================================================

-- Jean (Pratiquant standard) : A des skis et un casque
INSERT INTO User_equipement (id_user, id_equipements) VALUES
  (1, 3), 
  (1, 7); 

-- Paul (Sauveteur) : A tout le kit de sécurité avalanche + GPS
INSERT INTO User_equipement (id_user, id_equipements) VALUES
  (2, 1), -- DVA
  (2, 2), -- Airbag
  (2, 5), -- Pelle
  (2, 6), -- Sonde
  (2, 10); -- Montre GPS

-- Val (Pratiquant Snowboard)
INSERT INTO User_equipement (id_user, id_equipements) VALUES
  (3, 1), -- DVA (Conscient des risques)
  (3, 4); -- Snowboard

-- Sophie (Pratiquante)
INSERT INTO User_equipement (id_user, id_equipements) VALUES
  (4, 3), -- Ski
  (4, 9); -- Bâtons

-- ============================================================
-- 7. Activités
-- ============================================================
-- Activité 1 : Jean à Isola (Active, pas d'alerte)
INSERT INTO Activites (id, date, id_station, alerte, id_user, active) VALUES
  (1, NOW(), 1, FALSE, 1, TRUE);

-- Activité 2 : Val à Val Thorens (Active, ALERTE DÉCLENCHÉE !)
INSERT INTO Activites (id, date, id_station, alerte, id_user, active) VALUES
  (2, NOW(), 2, TRUE, 3, TRUE);

-- Activité 3 : Paul (Sauveteur) à Isola (Active, pas d'alerte)
INSERT INTO Activites (id, date, id_station, alerte, id_user, active) VALUES
  (3, NOW(), 1, FALSE, 2, TRUE);

-- ============================================================
-- 8. Positions 
-- ============================================================
SET @start = NOW();

-- Positions pour l'activité 1 (Jean à Isola - Piste bleue)
INSERT INTO Positions (id_activity, latitude, longitude, oxygene_restant, timestamp) VALUES
  (1, 44.1865, 7.1565, NULL, DATE_ADD(@start, INTERVAL 0 SECOND)),
  (1, 44.1870, 7.1570, NULL, DATE_ADD(@start, INTERVAL 30 SECOND)),
  (1, 44.1875, 7.1575, NULL, DATE_ADD(@start, INTERVAL 60 SECOND)),
  (1, 44.1880, 7.1580, NULL, DATE_ADD(@start, INTERVAL 90 SECOND));
 
INSERT INTO Positions (id_activity, latitude, longitude, oxygene_restant, timestamp) VALUES
  (2, 45.2971, 6.5796, 98, DATE_ADD(@start, INTERVAL 0 SECOND)),
  (2, 45.2980, 6.5805, 95, DATE_ADD(@start, INTERVAL 45 SECOND)),
  (2, 45.2990, 6.5815, 90, DATE_ADD(@start, INTERVAL 90 SECOND)), 
  (2, 45.2990, 6.5815, 88, DATE_ADD(@start, INTERVAL 120 SECOND)),
  (2, 45.2990, 6.5815, 85, DATE_ADD(@start, INTERVAL 150 SECOND));