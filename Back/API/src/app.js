const express = require('express');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const healthRouter = require('./routes/health');
const databaseRouter = require('./routes/database');
const iotRouter = require('./routes/iot');

const app = express();

app.use(logger);
app.use(express.json());

// Routes
app.use('/health', healthRouter);
// Monte les routes DB à la racine pour correspondre au Swagger
app.use('/', databaseRouter);
app.use('/api/iot', iotRouter);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// Error handler
app.use(errorHandler);

module.exports = app;
