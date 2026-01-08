import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

 
export interface Intervention {
  id: number;
  title: string;
  status: 'ongoing' | 'past';
}
 
export interface CoordonneesGPS {
  latitude: number;
  longitude: number;
}

export interface Victime {
  nom: string;
  prenom: string;
  age: number;
  sexe: string;
  groupe_sanguin: string;
  heure_debut: string;
  bpm: number;
  o2: number;
  pathologies: string;
  traitements: string;
  coordonnees_gps: CoordonneesGPS;
  trace?: Array<{ lat: number, lng: number, ts: string }>;
}

export interface InterventionSecoursRoot {
  status: string;
  intervention_secours: { victime: Victime };
}

@Injectable({ providedIn: 'root' })
export class InterventionService {
  
  constructor(private http: HttpClient) {}

  /**
   * Récupère la LISTE des interventions (pour intervention.component.ts)
   */
  getInterventionsByStation(stationId: number): Observable<Intervention[]> {
    return this.http.get<any>(`/api/stations/${stationId}/activities`).pipe(
      map(res => {
        if (!res.success) return []; 
        return res.data
          .filter((item: any) => item.alerte) 
          .map((item: any) => ({
            id: item.id,
            title: `Intervention #${item.id} - ${item.user_prenom} ${item.user_nom}`,
            status: item.active ? 'ongoing' : 'past' 
          }));
      })
    );
  }

  /**
   * Récupère les DETAILS d'une intervention (pour intervention-detail.component.ts)
   */
  getDetails(id: number): Observable<InterventionSecoursRoot> {
    return this.http.get<any>(`/api/activities/${id}`).pipe(
      map(res => {
        const data = res.data;
        
         let victime = data.intervention_secours?.victime || data.victime;

        
        if (victime && victime.coordonnees_gps) {
           if (!victime.trace || victime.trace.length === 0) {
              const lat = victime.coordonnees_gps.latitude;
              const lng = victime.coordonnees_gps.longitude;
              victime.trace = [
                { lat: lat, lng: lng, ts: '' } 
              ];
           }
        }

        return {
          status: data.status,
          intervention_secours: {
            victime: victime 
          }
        };
      })
    );
  }

  finishIntervention(id: number): Observable<void> {
    return this.http.put<any>(`/api/activities/${id}/finish`, {}).pipe(
      map(() => void 0)
    );
  }

   
  addPosition(activityId: number, lat: number, lng: number): Observable<any> {
    return this.http.post(`/api/activities/${activityId}/position`, {
      latitude: lat,
      longitude: lng
    });
  }
}