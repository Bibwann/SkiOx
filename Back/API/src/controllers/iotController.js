/**
 * Contrôleur pour les opérations IoT
 */

const iot = require('../iot');

/**
 * Récupère les données des capteurs
 */
exports.getSensorData = async (req, res, next) => {
  try {
    const data = await iot.getSensorData();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * Envoie une commande à un dispositif
 */
exports.sendCommand = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { command } = req.body;
    const result = await iot.sendCommand(deviceId, command);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère le statut d'un dispositif
 */
exports.getDeviceStatus = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const status = await iot.getDeviceStatus(deviceId);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère la liste de tous les dispositifs
 */
exports.getAllDevices = async (req, res, next) => {
  try {
    const devices = await iot.getDevices();
    res.json({ success: true, data: devices });
  } catch (error) {
    next(error);
  }
};
