/**
 * Module de gestion de la base de données
 * Contient toutes les fonctions d'interaction avec la BDD
 */

const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

let pool;

/**
 * Initialise la connexion à la base de données avec retry
 */
async function initDatabase(maxRetries = 10, delay = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      pool = mysql.createPool({
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
      });
      
      // Test de la connexion
      const connection = await pool.getConnection();
      console.log('✓ Database connection initialized');
      console.log('Config:', { ...dbConfig, password: '***' });
      connection.release();
      
      return { connected: true };
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('Max retries reached. Database connection failed.');
        throw error;
      }
      
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function ensurePool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() before using database functions.');
  }
}

/**
 * Récupère tous les utilisateurs
 */
async function getUsers() {
  ensurePool();
  const [rows] = await pool.query('SELECT * FROM Utilisateurs');
  return rows;
}

/**
 * Récupère un utilisateur par ID
 */
async function getUserById(id) {
  ensurePool();
  const [rows] = await pool.query('SELECT * FROM Utilisateurs WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Crée un nouvel utilisateur
 */
async function createUser(userData) {
  ensurePool();
  const { nom, prenom, sexe, date_naissance, password, id_roles } = userData;
  const [result] = await pool.query(
    'INSERT INTO Utilisateurs (nom, prenom, sexe, date_naissance, password, id_roles) VALUES (?, ?, ?, ?, ?, ?)',
    [nom, prenom, sexe, date_naissance, password, id_roles]
  );
  return { id: result.insertId, ...userData };
}

/**
 * Met à jour un utilisateur
 */ 
async function updateUser(id, userData) {
  ensurePool(); 
  const allowedColumns = [
    'nom', 'prenom', 'sexe', 'date_naissance', 'password', 'id_roles', 
    'email', 'groupe_sanguin', 'pathologies', 'traitements'
  ]; 
  const updates = [];
  const values = []; 
  for (const col of allowedColumns) {
    if (userData[col] !== undefined) {
      updates.push(`${col} = ?`);
      if (col === 'date_naissance' && typeof userData[col] === 'string') {
         values.push(userData[col].split('T')[0]); // Garde seulement YYYY-MM-DD
      } else {
         values.push(userData[col]);
      }
    }
  } 
  if (updates.length === 0) {
    return { id, ...userData };
  }
  values.push(id); 
  const query = `UPDATE Utilisateurs SET ${updates.join(', ')} WHERE id = ?`;
  await pool.query(query, values);
  return { id, ...userData };
}

/**
 * Supprime un utilisateur
 */
async function deleteUser(id) {
  ensurePool();
  await pool.query('DELETE FROM Utilisateurs WHERE id = ?', [id]);
  return { deleted: true, id };
}

// =============================
// Users <-> Equipements
// =============================
async function getUserEquipments(userId) {
  ensurePool();
  const [rows] = await pool.query(
    `SELECT e.id, e.name, e.link
     FROM Equipements e
     JOIN User_equipement ue ON ue.id_equipements = e.id
     WHERE ue.id_user = ?`,
    [userId]
  );
  return rows;
}

async function addUserEquipment(userId, id_equipement) {
  ensurePool();
  await pool.query(
    'INSERT INTO User_equipement (id_user, id_equipements) VALUES (?, ?)',
    [userId, id_equipement]
  );
  return { linked: true };
}

async function removeUserEquipment(userId, id_equipement) {
  ensurePool();
  await pool.query(
    'DELETE FROM User_equipement WHERE id_user = ? AND id_equipements = ?',
    [userId, id_equipement]
  );
  return { unlinked: true };
}

async function getAllEquipments() {
  ensurePool();
  const [rows] = await pool.query('SELECT * FROM Equipements');
  return rows;
}

// =============================
// Stations & Equipements
// ============================= 
async function getStations() {
  ensurePool(); 
  const [rows] = await pool.query('SELECT id, nom, localisation, latitude, longitude FROM Stations');
  return rows;
} 

async function getEquipmentsByStation(stationId) {
  ensurePool();
  const [rows] = await pool.query(
    `SELECT e.id, e.name, e.link
     FROM Equipements e
     JOIN equipement_station es ON es.id_equipements = e.id
     WHERE es.id_station = ?`,
    [stationId]
  );
  return rows;
}

async function addEquipmentToStation(stationId, id_equipement) {
  ensurePool();
  await pool.query(
    'INSERT INTO equipement_station (id_station, id_equipements) VALUES (?, ?)',
    [stationId, id_equipement]
  );
  return { linked: true };
}

async function removeEquipmentFromStation(stationId, id_equipement) {
  ensurePool();
  await pool.query(
    'DELETE FROM equipement_station WHERE id_station = ? AND id_equipements = ?',
    [stationId, id_equipement]
  );
  return { unlinked: true };
}

// =============================
// Activités avec alerte
// ============================= 

async function getActivitiesWithAlertByStation(stationId) {
  ensurePool(); 
  const [rows] = await pool.query(
    `SELECT a.id, a.date, a.id_station, a.alerte,
            s.nom AS station_nom,
            u.id AS user_id, u.nom AS user_nom, u.prenom AS user_prenom,
            a.active
     FROM Activites a
     JOIN Stations s ON s.id = a.id_station
     JOIN Utilisateurs u ON u.id = a.id_user
     WHERE a.id_station = ? AND a.alerte = TRUE
     ORDER BY a.active DESC, a.id DESC`, 
    [stationId]
  );
  return rows;
} 

/**
 * Crée une nouvelle activité pour un utilisateur
 */
async function createActivity(userId, stationId) {
  ensurePool();
  const [result] = await pool.query(
    'INSERT INTO Activites (date, id_station, id_user, active, alerte) VALUES (NOW(), ?, ?, TRUE, FALSE)',
    [stationId, userId]
  );
  return { id: result.insertId, status: 'started' };
}

 
async function addPosition(activityId, lat, lng) {
  ensurePool(); 
  if (lat === undefined || lat === null || lng === undefined || lng === null) {
      console.warn(`[BDD] Tentative d'insertion GPS invalide pour l'activité ${activityId}`);
      return { success: false, reason: 'Invalid coordinates' };
  }

  await pool.query(
    'INSERT INTO Positions (id_activity, latitude, longitude, timestamp) VALUES (?, ?, ?, NOW())',
    [activityId, lat, lng]
  );
  return { success: true };
}



/**
 * Active ou désactive l'alerte pour une activité
 */
async function setAlert(activityId, status) {
  ensurePool();
  await pool.query(
    'UPDATE Activites SET alerte = ? WHERE id = ?',
    [status, activityId]
  );
  return { success: true, alerte: status };
}

/**
 * Termine une activité (active = false)
 */
async function stopActivity(activityId) {
  ensurePool();
  await pool.query(
    'UPDATE Activites SET active = FALSE WHERE id = ?',
    [activityId]
  );
  return { success: true };
}
 
 
async function getActivityDetails(activityId) {
  ensurePool();  
  const [actRows] = await pool.query(
    `SELECT a.id, a.date, a.alerte, a.active,
            u.nom, u.prenom, u.date_naissance, u.sexe, u.groupe_sanguin, u.pathologies, u.traitements
     FROM Activites a
     JOIN Utilisateurs u ON u.id = a.id_user
     WHERE a.id = ?`,
    [activityId]
  );

  if (!actRows || actRows.length === 0) return null;
  const activity = actRows[0];
 
  const [posRows] = await pool.query(
    `SELECT latitude, longitude, timestamp 
     FROM Positions 
     WHERE id_activity = ? 
     ORDER BY timestamp ASC`,  
    [activityId]
  );

   
  const [dataRows] = await pool.query(
    `SELECT oxygene_restant, niveau_batterie, rythme_cardiaque, timestamp
     FROM Donnees
     WHERE id_activity = ?
     ORDER BY timestamp DESC LIMIT 1`,
    [activityId]
  );
 
   
  const lastData = (dataRows && dataRows.length > 0) ? dataRows[0] : {};
  const lastPos = (posRows && posRows.length > 0) ? posRows[posRows.length - 1] : null;
 
  let age = null;
  if (activity.date_naissance) {
     const birth = new Date(activity.date_naissance);
     if (!isNaN(birth)) {
        const now = new Date();
        age = now.getFullYear() - birth.getFullYear();
     }
  }
 
  
  const trace = (posRows || [])
    .filter(p => p.latitude != null && p.longitude != null)
    .map(p => ({
      lat: parseFloat(p.latitude),
      lng: parseFloat(p.longitude),
      ts: p.timestamp
    }));

  return {
    id: activity.id,
    status: activity.active ? (activity.alerte ? 'ongoing' : 'finished') : 'past',
    intervention_secours: {  
        victime: {
          nom: activity.nom,
          prenom: activity.prenom,
          age: age,
          sexe: activity.sexe ? 'Homme' : 'Femme',
          groupe_sanguin: activity.groupe_sanguin,
          pathologies: activity.pathologies || 'Aucune',
          traitements: activity.traitements || 'Aucun',
          heure_debut: activity.date, 
          // Utilisation de valeurs par défaut si l'IoT n'a rien envoyé
          bpm: lastData.rythme_cardiaque || 0,  
          o2: lastData.oxygene_restant || 0,
          batterie: lastData.niveau_batterie || 0,
          coordonnees_gps: {
            latitude: lastPos ? parseFloat(lastPos.latitude) : 0, // Evite le crash si pas de GPS
            longitude: lastPos ? parseFloat(lastPos.longitude) : 0
          },
          trace: trace 
        }
    }
  };
}

 
async function finishActivity(activityId) {
    ensurePool(); 
    await pool.query(
        'UPDATE Activites SET active = FALSE WHERE id = ?',
        [activityId]
    );
    return { success: true };
}

/**
 * Vérifie les identifiants d'un utilisateur
 */
async function getUserByCredentials(username, password) {
  ensurePool();
  const query = `
    SELECT u.*, r.name as role_name 
    FROM Utilisateurs u
    JOIN Roles r ON u.id_roles = r.id
    WHERE u.nom = ? AND u.password = ?
  `;
  const [rows] = await pool.query(query, [username, password]);
  return rows[0];
}

 
// Ajout des données IoT pour une activité
async function addIoTData(activityId, o2, bat, fc) {
  ensurePool();

  let targetActivityId = activityId;
  if (!targetActivityId) {
    const [rows] = await pool.query('SELECT id FROM Activites ORDER BY id DESC LIMIT 1');
    if (!rows || rows.length === 0) {
      console.warn('[IoT] Aucune activité trouvée pour associer les données.');
      return { success: false, reason: 'No activity found' };
    }
    targetActivityId = rows[0].id;
  }

  const bpm = fc ?? 0;
  const oxygene = o2 ?? 100;
  const batterie = bat ?? 100;

  await pool.query(
    `INSERT INTO Donnees (id_activity, rythme_cardiaque, oxygene_restant, niveau_batterie, timestamp)
     VALUES (?, ?, ?, ?, NOW())`,
    [targetActivityId, bpm, oxygene, batterie]
  );

  return { success: true, activityId: targetActivityId };
}

module.exports = {
  initDatabase,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByCredentials,
  // Users <-> Equipements
  getUserEquipments,
  addUserEquipment,
  removeUserEquipment,
  getAllEquipments,
  // Stations
  getStations,
  getEquipmentsByStation,
  addEquipmentToStation,
  removeEquipmentFromStation,
  getActivitiesWithAlertByStation, 
  addIoTData, 
  getActivityDetails, 
  finishActivity, 
  createActivity,
  addPosition,
  setAlert,
  stopActivity
};