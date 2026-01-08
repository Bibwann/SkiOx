require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./database/index');
const { initIoT } = require('./iot/index');

const PORT = process.env.PORT || 3000;

initDatabase()
    .then(async () => { 
        console.log('Database connection initialized');

        try {
            const iotStatus = await initIoT();
            if (iotStatus.connected) {
                console.log(`✓ IoT system initialized on port ${iotStatus.port}`);
            } else {
                console.warn(`! IoT system in simulation mode: ${iotStatus.mode || 'No device found'}`);
            }
        } catch (iotError) {
            console.error('! Failed to initialize IoT:', iotError.message);
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`SkiOx API listening on port ${PORT} (0.0.0.0)`);
        });
    })
    .catch((err) => {
        console.error('Erreur lors de l’init de la base:', err);
        process.exit(1);
    });