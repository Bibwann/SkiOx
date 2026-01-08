import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Définition de la structure des données que l'on reçoit de l'API
export interface AlertDetails {
  id: number;
  status: string;
  victime: {
    nom: string;
    prenom: string;
    age: number;
    sexe: string;
    groupe_sanguin: string;
    pathologies: string;
    traitements: string;
    heure_debut: string;
    // Les nouvelles données IoT
    bpm: number;       // Rythme cardiaque
    o2: number;        // Oxygène
    batterie: number;  // Niveau batterie
    // Position GPS
    coordonnees_gps: {
      latitude: number;
      longitude: number;
    };
    // Historique du tracé GPS
    trace: Array<{
      lat: number;
      lng: number;
      ts: string;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  // ⚠️ Vérifie que c'est bien l'URL de ton Backend
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  /**
   * Récupère les détails d'une alerte spécifique (Infos victime + GPS + IoT)
   */
  getAlertDetails(id: string): Observable<{ success: boolean; data: AlertDetails }> {
    return this.http.get<{ success: boolean; data: AlertDetails }>(`${this.apiUrl}/activities/${id}`);
  }

  /**
   * Permet au sauveteur de terminer l'intervention
   */
  finishIntervention(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/activities/${id}/finish`, {});
  }
}