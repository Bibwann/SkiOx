/**
 * Routes pour les opérations de base de données
 */

const express = require('express');
const router = express.Router();
const dbController = require('../controllers/databaseController');

// Login
router.post('/login', dbController.login);

// Routes pour les utilisateurs
router.get('/users', dbController.getAllUsers);
router.get('/users/:id', dbController.getUserById);
router.post('/users', dbController.createUser);
router.put('/users/:id', dbController.updateUser);
router.delete('/users/:id', dbController.deleteUser); 
router.get('/equipments', dbController.getAllEquipments);

// Lier/Délier équipements au profil utilisateur
router.get('/users/:userId/equipments', dbController.getUserEquipments); 
router.post('/users/:userId/equipments', dbController.addUserEquipment);
router.delete('/users/:userId/equipments', dbController.removeUserEquipment);

// Stations
router.get('/stations', dbController.getStations);

// Équipements d'une station
router.get('/stations/:stationId/equipments', dbController.getStationEquipments);
router.post('/stations/:stationId/equipments', dbController.addEquipmentToStation);
router.delete('/stations/:stationId/equipments', dbController.removeEquipmentFromStation);
 
router.get('/stations/:stationId/activities', dbController.getStationActivitiesWithAlert); 

router.get('/activities/:id', dbController.getActivityDetails); 
router.put('/activities/:id/finish', dbController.finishIntervention);
 
router.post('/activities', dbController.createActivity);
router.post('/activities/:id/position', dbController.addPosition);
router.put('/activities/:id/alert', dbController.toggleAlert);
router.put('/activities/:id/stop', dbController.stopActivity);

module.exports = router;

module.exports = router;