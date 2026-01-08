@echo off
echo Lancement de tout le projet SkiOx...
docker-compose --profile bdd --profile api --profile ihm up -d
echo Projet lance. Accedez a l'IHM sur http://localhost:4200, API sur http://localhost:3000, phpMyAdmin sur http://localhost:8080
pause