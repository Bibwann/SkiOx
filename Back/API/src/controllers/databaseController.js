/**
 * Contrôleur pour les opérations de base de données
 */

const db = require('../database');

/**
 * Récupère tous les utilisateurs
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await db.getUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un utilisateur par ID
 */
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await db.getUserById(id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un nouvel utilisateur
 */
exports.createUser = async (req, res, next) => {
  try {
    console.log('Creating user with data:', req.body);
    const userData = req.body;
    const newUser = await db.createUser(userData);
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    next(error);
  }
};

/**
 * Met à jour un utilisateur
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const updatedUser = await db.updateUser(id, userData);
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un utilisateur
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.deleteUser(id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les équipements d'un utilisateur
 */
exports.getUserEquipments = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const equipments = await db.getUserEquipments(userId);
    res.json({ success: true, data: equipments });
  } catch (error) {
    next(error);
  }
};


exports.getActivityDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const details = await db.getActivityDetails(id);
    if (!details) return res.status(404).json({ error: 'Activité non trouvée' });
    res.json({ success: true, data: details });
  } catch (error) {
    next(error);
  }
};

exports.finishIntervention = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.finishActivity(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
 
exports.createActivity = async (req, res, next) => {
  try {
    const { userId, stationId } = req.body;
    const result = await db.createActivity(userId, stationId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.addPosition = async (req, res, next) => {
  try {
    const { id } = req.params;  
    const { latitude, longitude } = req.body;
    await db.addPosition(id, latitude, longitude);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.toggleAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // true ou false
    await db.setAlert(id, status);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.stopActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.stopActivity(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
 
/**
 * Lier un équipement à un utilisateur
 */
exports.addUserEquipment = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { id_equipement } = req.body;
    await db.addUserEquipment(userId, id_equipement);
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Délier un équipement d'un utilisateur
 */
exports.removeUserEquipment = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { id_equipement } = req.query;
    await db.removeUserEquipment(userId, id_equipement);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getAllEquipments = async (req, res, next) => {
  try {
    const equipments = await db.getAllEquipments();
    res.json({ success: true, data: equipments });
  } catch (error) {
    next(error);
  }
};
/**
 * Liste des stations
 */
exports.getStations = async (req, res, next) => {
  try {
    const stations = await db.getStations();
    res.json({ success: true, data: stations });
  } catch (error) {
    next(error);
  }
};

/**
 * Équipements d'une station
 */
exports.getStationEquipments = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const equipments = await db.getEquipmentsByStation(stationId);
    res.json({ success: true, data: equipments });
  } catch (error) {
    next(error);
  }
};

exports.addEquipmentToStation = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { id_equipement } = req.body;
    await db.addEquipmentToStation(stationId, id_equipement);
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.removeEquipmentFromStation = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { id_equipement } = req.query;
    await db.removeEquipmentFromStation(stationId, id_equipement);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Activités avec alerte = true pour une station
 */
exports.getStationActivitiesWithAlert = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const activities = await db.getActivitiesWithAlertByStation(stationId);
    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion utilisateur
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await db.getUserByCredentials(username, password);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    // Map role name to frontend expected roles (sauveteur, sportif)
    let role = 'sportif';
    if (user.role_name === 'Sauveteur') {
      role = 'sauveteur';
    } else if (user.role_name === 'Pratiquant') {
      role = 'sportif';
    }

    res.json({ 
      success: true, 
      data: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        role: role
      }
    });
  } catch (error) {
    next(error);
  }
};