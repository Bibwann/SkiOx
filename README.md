# SkiOx

SkiOx est une application web pour les sportifs et sauveteurs en station de ski. Elle permet aux sportifs de suivre leur activité, gérer leur équipement et recevoir des alertes, tandis que les sauveteurs peuvent intervenir efficacement.

## Architecture

Le projet est composé de trois parties principales :
- **BDD** : Base de données MySQL avec scripts d'initialisation
- **API** : API REST en Node.js pour la logique métier
- **IHM** : Interface utilisateur en Angular pour les sportifs et sauveteurs

## Prérequis

- Docker et Docker Compose installés
- Node.js (pour développement local)
- Angular CLI (pour développement IHM)

## Installation et Lancement avec Docker

Le projet utilise Docker pour faciliter le déploiement. Un fichier `docker-compose.yml` à la racine permet de lancer les services individuellement ou ensemble.

Note: les variables MySQL sont dans [Back/BDD/.env](Back/BDD/.env). Aucune copie dans un dossier `BDD/` à la racine n'est nécessaire.

### Configuration des variables d'environnement (BDD)

Avant de lancer le projet, initialisez le fichier d'environnement:

```bash
cp BDD/.env.example BDD/.env
```

Adaptez les valeurs dans `BDD/.env` si nécessaire:

```
MYSQL_ROOT_PASSWORD=changeme_root
MYSQL_DATABASE=skiox
MYSQL_USER=skiox_user
MYSQL_PASSWORD=skiox_pass
```

Commandes utiles (Windows PowerShell) :

```
Copy-Item .\Back\BDD\.env.example .\Back\BDD\.env
```

Ensuite, lancez:

```
docker-compose --profile bdd --profile api --profile ihm up -d --build
```

### Lancer tout le projet

Exécutez le script `run-all.bat` (Windows) ou la commande suivante :

```bash
docker-compose --profile bdd --profile api --profile ihm up -d
```

Cela lance :
- La base de données MySQL (port 3306)
- phpMyAdmin (port 8080)
- L'API (port 3000)
- L'IHM (port 4200)

## Accès aux services
- **IHM** : http://localhost:4200
- **API** : http://localhost:3000
- **phpMyAdmin** : http://localhost:8080
- **Base de données** : localhost:3306

### Lancer des services spécifiques

- **Seulement la BDD** :
  ```bash
  docker-compose --profile bdd up -d
  ```
  Accès : phpMyAdmin sur http://localhost:8080

- **Seulement l'API** (inclut la BDD) :
  ```bash
  docker-compose --profile api up -d
  ```
  Accès : API sur http://localhost:3000

- **Seulement l'IHM** :
  ```bash
  docker-compose --profile ihm up -d
  ```
  Accès : Interface sur http://localhost:4200

- **BDD + API** :
  ```bash
  docker-compose --profile bdd --profile api up -d
  ```

### Arrêter les services

```bash
docker-compose down
```

## Développement local

### API
```bash
cd Back/API
npm install
npm start
```

### IHM
```bash
cd IHM
npm install
ng serve
```
Accès : http://localhost:4200

### Base de données
Utilisez le docker-compose pour la BDD ou configurez MySQL localement avec les scripts dans `BDD/init/`.

## Structure du projet

```
SkiOx/
├── Back/
│   ├── API/                # Code de l'API Node.js
│   ├── BDD/                # Dossier BDD avec .env et scripts SQL
│   │   ├── init/           # Scripts SQL d'initialisation
│   │   └── .env            # Variables d'environnement MySQL (source de vérité)
│   └── docker-compose.yml  # Ancien compose (remplacé par celui à la racine)
├── IHM/                    # Application Angular
├── Docs/                   # Documentation
├── docker-compose.yml      # Compose principal
└── run-all.bat             # Script pour lancer tout
```

## Fonctionnalités

### Pour les sportifs
- Connexion et inscription
- Carte interactive des stations
- Météo en temps réel
- Gestion de l'équipement SkiOx
- Suivi de l'activité

### Pour les sauveteurs
- Interface dédiée
- Gestion des interventions
- Accès aux données des sportifs

## Technologies utilisées

- **Backend** : Node.js, Express
- **Base de données** : MySQL
- **Frontend** : Angular
- **Cartes** : Leaflet
- **Conteneurisation** : Docker

## Auteurs

Projet réalisé dans le cadre de SAE5 à l'IUT Nice Côte d'Azur.

## Licence

Ce projet est sous licence MIT.
