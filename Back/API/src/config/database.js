/**
 * Configuration de la connexion à la base de données
 */

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'skiox_db',
  user: process.env.DB_USER || 'skiox_user',
  password: process.env.DB_PASSWORD || 'skiox_password',
};

module.exports = dbConfig;
