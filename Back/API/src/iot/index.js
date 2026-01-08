const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const db = require('../database/index');

const CLE_BT = "8qabEK1RS8ipG!XKv&gDxKXf&tNNQz";

let derniereDonnee = {
    fc: 0, o2: 0, bat: 0, vanne: 0,
    timestamp: new Date().toISOString()
};

/**
 * Applique le XOR pour le déchiffrement
 */
function applyXOR(input) {
    let result = "";
    for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input.charCodeAt(i) ^ CLE_BT.charCodeAt(i % CLE_BT.length));
    }
    return result;
}

/**
 * Décode la trame Arduino
 */
function decoderMessageArduino(data) {
    try {
        const raw = data.trim();
        if (!raw) return null;

        let finalString = "";
        const isHex = /^[0-9A-Fa-f]+$/.test(raw);

        if (isHex) {
            const fromHex = Buffer.from(raw, 'hex').toString();
            finalString = applyXOR(fromHex);
        } else {
            finalString = applyXOR(raw);
        }

        const parts = finalString.split(';');
        if (parts.length === 4) {
            return {
                fc: parseInt(parts[0], 10),
                o2: parseInt(parts[1], 10),
                bat: parseInt(parts[2], 10),
                vanne: parseInt(parts[3], 10)
            };
        }
    } catch (e) {
        console.error(`[IoT] Erreur parsing : ${e.message}`);
    }
    return null;
}

/**
 * Gère la réception et l'insertion en base
 */
async function handleIncomingData(line) {
    const decoded = decoderMessageArduino(line);

    if (decoded) {
        derniereDonnee = { ...decoded, timestamp: new Date().toISOString() };
        console.log(`[IoT] REÇU -> FC: ${decoded.fc} | O2: ${decoded.o2}% | BAT: ${decoded.bat}%`);

        try {
            const activityId = null; 
            await db.addIoTData(activityId, decoded.o2, decoded.bat, decoded.fc);
            
            console.log(`[BDD] Données capteurs insérées pour l'activité ${activityId}`);
        } catch (error) {
            console.error(`[BDD] Erreur insertion : ${error.message}`);
        }
    } else {
        console.log(`[DEBUG] Trame invalide : "${line}"`);
    }
}

/**
 * Initialisation de la connexion
 */
async function initIoT() {
    if (process.env.NODE_ENV === 'test') return { connected: false };

    try {
        const ports = await SerialPort.list();
        const target = ports.find(p => p.manufacturer?.includes('Arduino') || p.path === 'COM3');
        const path = target ? target.path : (ports[0]?.path || null);

        if (!path) return { connected: false };

        const port = new SerialPort({ path, baudRate: 9600 });
        const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        port.on('open', () => console.log(`[IoT] Connecté sur ${path}`));

        parser.on('data', (raw) => {
            const line = raw.toString().trim();
            if (line) handleIncomingData(line);
        });

        return { connected: true, port: path };
    } catch (err) {
        console.error(`[IoT] Init Error: ${err.message}`);
        return { connected: false };
    }
}

module.exports = {
    initIoT,
    getSensorData: async () => derniereDonnee,
    getDeviceStatus: async () => ({ status: 'online', lastSeen: derniereDonnee.timestamp }),
    getDevices: async () => [{ id: 'Arduino_USB', type: 'sensor' }],
    sendCommand: async () => ({ success: false })
};