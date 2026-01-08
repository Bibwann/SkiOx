/**
 * Configuration pour la communication IoT
 */

const iotConfig = {
  broker: process.env.IOT_BROKER || 'mqtt://localhost',
  port: process.env.IOT_PORT || 1883,
  clientId: process.env.IOT_CLIENT_ID || 'skiox-api',
  username: process.env.IOT_USERNAME || '',
  password: process.env.IOT_PASSWORD || '',
};

module.exports = iotConfig;
