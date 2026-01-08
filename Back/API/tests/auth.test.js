const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/index');

jest.mock('../src/database/index');

describe('Auth Endpoints', () => {
  
  it('POST /login devrait connecter un utilisateur valide', async () => { 
    db.getUserByCredentials.mockResolvedValue({
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      role_name: 'Sauveteur'
    });

    const res = await request(app)
      .post('/login')
      .send({ username: 'Dupont', password: 'password123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('sauveteur');  
  });

  it('POST /login devrait rejeter des identifiants invalides', async () => { 
    db.getUserByCredentials.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/login')
      .send({ username: 'Inconnu', password: 'badpassword' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});