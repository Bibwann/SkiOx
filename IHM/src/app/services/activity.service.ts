import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  // --- Gestion de l'état ---
  private currentActivityIdSubject = new BehaviorSubject<number | null>(null);
  public currentActivityId$ = this.currentActivityIdSubject.asObservable();

  private isRunningSubject = new BehaviorSubject<boolean>(false);
  public isRunning$ = this.isRunningSubject.asObservable();

  private isAlertSubject = new BehaviorSubject<boolean>(false);
  public isAlert$ = this.isAlertSubject.asObservable();

  private watchId: number | null = null;
  public lastPosition = { lat: 0, lng: 0 };

  constructor(private http: HttpClient) { }

  /**
   * 1. Démarre l'activité en récupérant d'abord la VRAIE position GPS
   */
  startActivity(userId: number, stationId: number): void {
    console.log('[GPS] Recherche de la position de départ...');

    if (!navigator.geolocation) {
      alert("Géolocalisation non supportée. L'activité débutera à la position par défaut.");
      this.createActivityInDb(userId, stationId, 45.2971, 6.5796); // Fallback (Val Thorens)
      return;
    }

    // On force une localisation précise avant de créer l'activité
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log('[GPS] Position de départ trouvée :', pos.coords);
        this.createActivityInDb(userId, stationId, pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error('[GPS] Erreur départ:', err);
        alert("Impossible de vous localiser précisément. Démarrage sur la station.");
        this.createActivityInDb(userId, stationId, 45.2971, 6.5796);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  /**
   * 2. Crée l'activité en BDD puis lance le tracking continu
   */
  private createActivityInDb(userId: number, stationId: number, lat: number, lng: number) {
    this.http.post<any>('/api/activities', { userId, stationId }).subscribe(res => {
      if (res.success) {
        const activityId = res.data.id;
        
        // Mise à jour état local
        this.currentActivityIdSubject.next(activityId);
        this.isRunningSubject.next(true);
        this.lastPosition = { lat, lng };

        // Envoi du point de départ
        this.sendPosition(activityId, lat, lng, 98).subscribe();

        // Lancement du monitoring continu
        this.startWatch(activityId);
      }
    });
  }

  /**
   * 3. Suit la position en temps réel
   */
  private startWatch(activityId: number) {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          console.log('[GPS] Update:', position.coords);
          
          this.lastPosition = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          };
          
          // Simulation O2
          const fakeO2 = Math.max(85, 98 - Math.floor(Math.random() * 5));

          this.sendPosition(activityId, position.coords.latitude, position.coords.longitude, fakeO2).subscribe();
        },
        (err) => console.error('[GPS] Erreur watch:', err),
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    }
  }

  stopActivity(): void {
    const id = this.currentActivityIdSubject.value;
    if (!id) return;

    this.http.put(`/api/activities/${id}/stop`, {}).subscribe(() => {
        this.resetState();
    });
  }

  toggleAlert(): void {
    const id = this.currentActivityIdSubject.value;
    const newStatus = !this.isAlertSubject.value;
    
    if (id) {
        // Envoi immédiat de la dernière position connue pour être sûr
        if (this.lastPosition.lat !== 0) {
            this.sendPosition(id, this.lastPosition.lat, this.lastPosition.lng, 90).subscribe();
        }

        this.http.put(`/api/activities/${id}/alert`, { status: newStatus }).subscribe(() => {
            this.isAlertSubject.next(newStatus);
        });
    }
  }

  private resetState() {
    this.currentActivityIdSubject.next(null);
    this.isRunningSubject.next(false);
    this.isAlertSubject.next(false);
    
    if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
    }
  }

  sendPosition(activityId: number, lat: number, lng: number, o2: number): Observable<any> {
    return this.http.post(`/api/activities/${activityId}/position`, { 
      latitude: lat, 
      longitude: lng, 
      oxygene_restant: o2 
    });
  }
   
  updateLocalPosition(lat: number, lng: number) {
      this.lastPosition = { lat, lng };
  }
}