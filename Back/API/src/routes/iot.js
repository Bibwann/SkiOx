/**
 * Routes pour les opérations IoT
 */

const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

// Routes pour les dispositifs IoT
router.get('/devices', iotController.getAllDevices);
router.get('/devices/:deviceId/status', iotController.getDeviceStatus);
router.post('/devices/:deviceId/command', iotController.sendCommand);

// Routes pour les capteurs
router.get('/sensors/data', iotController.getSensorData);

module.exports = router;
