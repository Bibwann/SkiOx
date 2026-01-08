import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MeteoService, MeteoData } from '../../services/meteo.service';
import { AuthService } from '../../auth/auth.service'; 
import { StationService } from '../../services/station.service';

interface Station {
  id: number;
  nom: string;
  localisation: string;
}

interface Equipment {
  id: number;
  name: string;
  link: string;
}

@Component({
  selector: 'app-equipement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipement.component.html',
  styleUrls: ['./equipement.component.scss']
})
export class EquipementComponent implements OnInit {
  user: any;
  userId: number = 0;

  stations: Station[] = [];
  selectedStationId: number | null = null;
  selectedStation: Station | null = null;
  meteo: MeteoData | null = null;
  meteoLoading: boolean = false;

  stationEquipments: Equipment[] = [];
  stationEquipmentsLoading: boolean = false;

  userEquipments: Equipment[] = [];
  userEquipmentsLoading: boolean = false;

  allEquipments: Equipment[] = [];

  showAddUserEquipmentModal: boolean = false;
  equipmentToDelete: { id: number, type: 'user' | 'station' } | null = null;

  private stationToMeteoCity: { [key: string]: string } = {
    'Val Thorens': 'Modane',
    'Courchevel': 'Aime',
    'Isola 2000': 'Isola'
  };

  private weatherTranslations: { [key: string]: string } = {
    'Clear': 'Clair',
    'Sunny': 'Ensoleillé',
    'Partly cloudy': 'Partiellement nuageux',
    'Cloudy': 'Nuageux',
    'Overcast': 'Couvert',
    'Mist': 'Brume',
    'Fog': 'Brouillard',
    'Light drizzle': 'Pluie fine',
    'Light rain': 'Pluie légère',
    'Rain': 'Pluie',
    'Heavy rain': 'Pluie forte',
    'Light snow': 'Neige légère',
    'Snow': 'Neige',
    'Heavy snow': 'Neige forte',
    'Blizzard': 'Tempête de neige',
    'Thunderstorm': 'Orage',
    'Light drizzle and rain': 'Pluie fine',
    'Patchy rain possible': 'Pluie possible par endroits'
  };

  constructor(
    private http: HttpClient,
    private meteoService: MeteoService,
    private auth: AuthService, 
    private stationService: StationService
  ) {
    this.user = this.auth.getUser();
    if (this.user && this.user.id) {
      this.userId = this.user.id;
    }
  }

  ngOnInit(): void {
    this.loadStations();
    this.loadAllEquipments();
    if (this.userId) {
        this.loadUserEquipments();
    }
  }

  loadStations(): void {
    this.http.get<any>('/api/stations').subscribe({
      next: (response) => {
        this.stations = response.data; 
        const savedStation = this.stationService.getStation(); 
        if (savedStation && this.stations.some(s => s.id === savedStation.id)) {
          this.selectedStationId = savedStation.id;
        } else if (this.stations.length > 0) {
          this.selectedStationId = this.stations[0].id;
        }

         
        if (this.selectedStationId) {
          this.onStationChange();
        }
      },
      error: (err) => {
        console.error('Erreur API Stations:', err);
      }
    });
  }

  loadAllEquipments(): void {
    this.http.get<any>('/api/equipments').subscribe({
      next: (response) => {
        this.allEquipments = response.data;
      },
      error: (err) => {
        console.error('Erreur API All Equipments:', err);
      }
    });
  }

  loadStationEquipments(stationId: number): void {
    this.stationEquipmentsLoading = true;
    this.http.get<any>(`/api/stations/${stationId}/equipments`).subscribe({
      next: (response) => {
        this.stationEquipments = response.data;
        this.stationEquipmentsLoading = false;
      },
      error: (err) => {
        console.error('Erreur API Station Equipments:', err);
        this.stationEquipmentsLoading = false;
      }
    });
  }

  isEquipmentInStation(equipmentId: number): boolean {
    return this.stationEquipments.some(e => e.id === equipmentId);
  }

  loadUserEquipments(): void {
    this.userEquipmentsLoading = true;
    this.http.get<any>(`/api/users/${this.userId}/equipments`).subscribe({
      next: (response) => {
        this.userEquipments = response.data; 
        this.userEquipmentsLoading = false;
      },
      error: (err) => {
        console.error('Erreur API User Equipments:', err);
        this.userEquipmentsLoading = false;
      }
    });
  }

  addEquipmentToUser(equipmentId: number): void {
    this.http.post(`/api/users/${this.userId}/equipments`, {
      id_equipement: equipmentId
    }).subscribe({
      next: () => {
        this.loadUserEquipments();
      },
      error: (err) => {
        console.error('Erreur ajout équipement:', err);
      }
    });
  }

  removeEquipmentFromUser(equipmentId: number): void {
    this.http.delete(`/api/users/${this.userId}/equipments?id_equipement=${equipmentId}`).subscribe({
      next: () => {
        this.loadUserEquipments();
      },
      error: (err) => {
        console.error('Erreur suppression équipement:', err);
      }
    });
  }

  isEquipmentInUserProfile(equipmentId: number): boolean {
    return this.userEquipments.some(e => e.id === equipmentId);
  }

  confirmDeleteEquipment(equipmentId: number, type: 'user' | 'station'): void {
    this.equipmentToDelete = { id: equipmentId, type: type };
  }

  deleteEquipment(): void {
    if (!this.equipmentToDelete) return;

    if (this.equipmentToDelete.type === 'user') {
      this.removeEquipmentFromUser(this.equipmentToDelete.id);
    }
    this.equipmentToDelete = null;
  }

  cancelDelete(): void {
    this.equipmentToDelete = null;
  }

  onStationChange(): void {
    const id = Number(this.selectedStationId);
    this.selectedStation = this.stations.find(s => s.id === id) || null;

    if (this.selectedStation) {
      // AJOUT : Sauvegarde globale
      this.stationService.setStation(this.selectedStation);

      this.loadMeteo(this.selectedStation.nom);
      this.loadStationEquipments(this.selectedStation.id);
    }
  }

  loadMeteo(stationName: string): void {
    this.meteoLoading = true;
    const city = this.stationToMeteoCity[stationName] || stationName;
    
    this.meteoService.getMeteoByCity(city).subscribe({
      next: (data: MeteoData) => {
        this.meteo = data;
        this.meteoLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur Météo:', err);
        this.meteoLoading = false;
      }
    });
  }

  translateCondition(condition: string): string {
    return this.weatherTranslations[condition] || condition;
  }
}