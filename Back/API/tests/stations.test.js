const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/index');
 
jest.mock('../src/database/index');

describe('Endpoints Stations', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });
 
  it('GET /stations devrait renvoyer la liste des stations', async () => {
    const mockStations = [
      { id: 1, nom: 'Isola 2000', localisation: 'Alpes-Maritimes' },
      { id: 2, nom: 'Auron', localisation: 'Alpes-Maritimes' }
    ];

    db.getStations.mockResolvedValue(mockStations);

    const res = await request(app).get('/stations');

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].nom).toBe('Isola 2000');
  });
 
  it('GET /stations/:id/equipments devrait renvoyer les équipements liés', async () => {
    const mockEquipments = [
      { id: 1, name: 'DVA', link: 'http://...' },
      { id: 3, name: 'Pelle', link: 'http://...' }
    ];

    db.getEquipmentsByStation.mockResolvedValue(mockEquipments); 
    const res = await request(app).get('/stations/1/equipments');

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true); 
    expect(db.getEquipmentsByStation).toHaveBeenCalledWith('1');
    expect(res.body.data).toEqual(mockEquipments);
  });
});