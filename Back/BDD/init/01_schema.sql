SET FOREIGN_KEY_CHECKS = 0;

-- Suppression des tables existantes pour repartir proprement
DROP TABLE IF EXISTS User_equipement;
DROP TABLE IF EXISTS equipement_station;
DROP TABLE IF EXISTS Donnees;    -- AJOUTÉ : La table manquante
DROP TABLE IF EXISTS Positions;
DROP TABLE IF EXISTS Activites;
DROP TABLE IF EXISTS Equipements;
DROP TABLE IF EXISTS Stations;
DROP TABLE IF EXISTS Utilisateurs;
DROP TABLE IF EXISTS Roles;

SET FOREIGN_KEY_CHECKS = 1;
 CREATE TABLE Roles (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE Utilisateurs (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    sexe VARCHAR(10),        
    date_naissance DATE, 
    password VARCHAR(255),
    id_roles BIGINT UNSIGNED NOT NULL, 
    email VARCHAR(255),
    groupe_sanguin VARCHAR(10),
    pathologies TEXT,
    traitements TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE Stations (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(255),
    localisation VARCHAR(255),
    latitude DECIMAL(10, 8), 
    longitude DECIMAL(11, 8), 
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE Equipements (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(255),
    link TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE Activites (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    date DATE, 
    alerte BOOLEAN DEFAULT FALSE,
    id_user BIGINT UNSIGNED NOT NULL,
    id_station BIGINT UNSIGNED NOT NULL,
    active BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE Positions (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    id_activity BIGINT UNSIGNED NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE Donnees (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    id_activity BIGINT UNSIGNED NOT NULL,
    rythme_cardiaque INT DEFAULT 0,
    oxygene_restant INT DEFAULT 100,
    niveau_batterie INT DEFAULT 100,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE equipement_station (
    id_station BIGINT UNSIGNED NOT NULL,
    id_equipements BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (id_station, id_equipements)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE User_equipement (
    id_user BIGINT UNSIGNED NOT NULL,
    id_equipements BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (id_user, id_equipements)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

 

ALTER TABLE Utilisateurs
    ADD CONSTRAINT fk_utilisateurs_roles 
    FOREIGN KEY (id_roles) REFERENCES Roles(id) 
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE Activites
    ADD CONSTRAINT fk_activites_utilisateurs 
    FOREIGN KEY (id_user) REFERENCES Utilisateurs(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE Activites
    ADD CONSTRAINT fk_activites_stations
    FOREIGN KEY (id_station) REFERENCES Stations(id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE Positions
    ADD CONSTRAINT fk_positions_activites 
    FOREIGN KEY (id_activity) REFERENCES Activites(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;
 
ALTER TABLE Donnees
    ADD CONSTRAINT fk_donnees_activites 
    FOREIGN KEY (id_activity) REFERENCES Activites(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE equipement_station
    ADD CONSTRAINT fk_eqst_station 
    FOREIGN KEY (id_station) REFERENCES Stations(id) 
    ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_eqst_equipements 
    FOREIGN KEY (id_equipements) REFERENCES Equipements(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE User_equipement
    ADD CONSTRAINT fk_ue_user 
    FOREIGN KEY (id_user) REFERENCES Utilisateurs(id) 
    ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_ue_equipements 
    FOREIGN KEY (id_equipements) REFERENCES Equipements(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;