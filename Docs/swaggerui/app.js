const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('yaml');

const app = express();
const port = 3000;

// Charger le fichier YAML
const file = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDocument = yaml.parse(file);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Exemple de route
app.get('/hello', (req, res) => {
  res.send('Hello depuis l\'API !');
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
  console.log(`Swagger UI dispo sur http://localhost:${port}/api-docs`);
});