const request = require('supertest');
const app = require('../src/app'); 

describe('Endpoints API Health', () => {
  it('GET /health devrait renvoyer 200 et un statut ok', async () => {
    const res = await request(app).get('/health');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
  });
});