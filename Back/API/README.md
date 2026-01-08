# API Suivi Activités & IoT

Cette API Express permet de gérer les utilisateurs, équipements, stations, activités et la remontée de données IoT pour le projet SkiOx.

## Fonctionnalités principales
- Authentification et inscription des utilisateurs
- Gestion des profils sportifs et équipements
- Gestion des stations et équipements associés
- Remontée de données capteurs et alertes IoT

## Prérequis
- Node.js >= 18
- Base de données MySQL/MariaDB
- Fichier `.env` configuré (voir exemple ci-dessous)

## Installation
```bash
npm install
```

## Configuration
Créez un fichier `.env` à la racine du dossier `API` avec vos paramètres de connexion :
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=motdepasse
DB_NAME=skiOx
PORT=3000
```

## Lancement
```bash
node src/app.js
```


## Swagger
La documentation complète est disponible dans le dossier `Docs/swaggerui/swagger.yaml`.

---
Pour toute question ou bug, ouvrez une issue ou contactez l'équipe SkiOx.



