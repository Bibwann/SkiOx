# Swagger UI local
 
Prérequis
- Node.js (version 14+ recommandée)

Installation
1. Ouvrir un terminal dans le dossier `Docs/swaggerui`.
2. Installer les dépendances :

```powershell
npm install
```

Exécution

Pour démarrer le serveur et accéder à la documentation OpenAPI :

```powershell
node app.js
```

Le serveur écoute par défaut sur le port `3001` :
- Swagger UI : http://localhost:3001/api-docs 

Personnaliser la spec OpenAPI

Le fichier `swagger.yaml` à la racine de ce dossier contient la définition OpenAPI. Modifiez-le puis redémarrez le serveur pour voir les changements dans Swagger UI.

Bonnes pratiques
- Versionnez `swagger.yaml` dans votre dépôt.
- Validez votre spec avec un validateur OpenAPI si nécessaire.

Si vous voulez lancer le serveur via un script npm, ajoutez dans `package.json` :

```json
"scripts": {
	"start": "node app.js"
}
```

Puis lancez :

```powershell
npm start
```
 