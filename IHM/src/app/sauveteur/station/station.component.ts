import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { MeteoService, MeteoData } from '../../services/meteo.service';
import { StationService } from '../../services/station.service';

interface Station {
  id: number;
  nom: string;
  localisation: string;
}

interface Equipment {
  id: number;
  name: string;
}

@Component({
  selector: 'app-station-sauveteur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './station.component.html',
  styleUrls: ['./station.component.scss']
})
export class StationComponent implements OnInit {
  user: any;
  
  stations: Station[] = [];
  selectedStationId: number | null = null;
  selectedStation: Station | null = null;
  
  meteo: MeteoData | null = null;
  meteoLoading: boolean = false;

  stationEquipments: Equipment[] = []; 
  allEquipments: Equipment[] = []; 
  loadingEquipments: boolean = false;

  // Gestion des Modales
  showAddModal: boolean = false;
  showDeleteModal: boolean = false; // NOUVEAU : Contrôle explicite
  equipmentToDelete: number | null = null;

  constructor(
    private http: HttpClient,
    private meteoService: MeteoService,
    private auth: AuthService,
    private stationService: StationService
  ) {
    this.user = this.auth.getUser();
  }

  ngOnInit(): void {
    this.loadStations();
    this.loadAllEquipments();
  }

  loadStations(): void {
    this.stationService.getStations().subscribe({
      next: (data) => {
        this.stations = data;
        const saved = this.stationService.getStation();
        if (saved && this.stations.some(s => s.id === saved.id)) {
          this.selectedStationId = saved.id;
        } else if (this.stations.length > 0) {
          this.selectedStationId = this.stations[0].id;
        }
        if (this.selectedStationId) this.onStationChange();
      },
      error: (err) => console.error('Erreur stations', err)
    });
  }

  loadAllEquipments(): void {
    this.http.get<any>('/api/equipments').subscribe({
      next: (res) => this.allEquipments = res.data || res,
      error: (err) => console.error('Erreur catalogue', err)
    });
  }

  onStationChange(): void {
    const id = Number(this.selectedStationId);
    this.selectedStation = this.stations.find(s => s.id === id) || null;
    
    if (this.selectedStation) {
      this.stationService.setStation(this.selectedStation);
      this.loadMeteo(this.selectedStation.nom);
      this.loadStationEquipments(id);
    }
  }

  loadStationEquipments(stationId: number): void {
    this.loadingEquipments = true;
    this.http.get<any>(`/api/stations/${stationId}/equipments`).subscribe({
      next: (res) => {
        this.stationEquipments = res.data || res;
        this.loadingEquipments = false;
      },
      error: () => this.loadingEquipments = false
    });
  }

  addEquipmentToStation(equipId: number): void {
    if (!this.selectedStationId) return;
    
    this.http.post(`/api/stations/${this.selectedStationId}/equipments`, { 
      id_equipement: equipId 
    }).subscribe({
      next: () => {
        this.loadStationEquipments(this.selectedStationId!);
      },
      error: (err) => console.error('Erreur ajout', err)
    });
  }

  isEquipmentInStation(equipId: number): boolean {
    return this.stationEquipments.some(e => e.id === equipId);
  }

  // --- SUPPRESSION CORRIGÉE ---
  confirmDelete(equipId: number): void {
    this.equipmentToDelete = equipId;
    this.showDeleteModal = true; // On ouvre la modale explicitement
  }

  deleteEquipment(): void {
    if (this.equipmentToDelete === null || !this.selectedStationId) return;

    this.http.delete(`/api/stations/${this.selectedStationId}/equipments?id_equipement=${this.equipmentToDelete}`)
      .subscribe({
        next: () => {
          this.loadStationEquipments(this.selectedStationId!);
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          this.closeDeleteModal();
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.equipmentToDelete = null;
  }

  loadMeteo(ville: string): void {
    this.meteoLoading = true;
    const v = ville.replace(' 2000', '').replace(' 1850', '');
    this.meteoService.getMeteoByCity(v).subscribe({
      next: (d) => { this.meteo = d; this.meteoLoading = false; },
      error: () => this.meteoLoading = false
    });
  }
}