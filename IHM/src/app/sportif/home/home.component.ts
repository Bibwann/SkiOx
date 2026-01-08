import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { StationService } from '../../services/station.service';
import { MeteoService, MeteoData } from '../../services/meteo.service';
import { ActivityService } from '../../services/activity.service';
import { InterventionService } from '../../services/intervention.service'; 
import * as L from 'leaflet';
import { Subscription, interval } from 'rxjs'; 

interface Station {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
}

const iconDefault = L.icon({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  user: any;
  stations: Station[] = [];
  selectedStationId: number | null = null;
  meteo: MeteoData | null = null;
  meteoLoading: boolean = false;
  
  map!: L.Map;
  marker!: L.Marker;

  isActivityRunning = false;
  isAlertActive = false;
   
  currentActivityId: number | null = null;

  private subs: Subscription[] = [];
  private gpsSub: Subscription | undefined; 

  skiox = { connected: true, battery: 87, armed: false };

  constructor(
    private auth: AuthService,
    private router: Router,
    private stationService: StationService,
    private meteoService: MeteoService,
    public activityService: ActivityService,
    private interventionService: InterventionService
  ) {
    this.user = this.auth.getUser();
  }

  ngOnInit() {
    this.loadStations();
 
    this.subs.push(
       
      this.activityService.currentActivityId$.subscribe(id => {
        this.currentActivityId = id;
      }),

      this.activityService.isRunning$.subscribe(v => {
        this.isActivityRunning = v;
        this.skiox.armed = v;
        
        if (v) {
          this.startGpsTracking();
        } else {
          this.stopGpsTracking();
        }
      }),

      this.activityService.isAlert$.subscribe(v => this.isAlertActive = v)
    );
  }

  ngAfterViewInit() {
    if(document.getElementById('container-carte')) {
      this.initMap();
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.stopGpsTracking(); 
  }

  startGpsTracking() {
    console.log("Démarrage du suivi GPS...");
    this.gpsSub = interval(5000).subscribe(() => {
      this.updateAndSendPosition();
    });
    this.updateAndSendPosition();
  }

  stopGpsTracking() {
    if (this.gpsSub) {
      this.gpsSub.unsubscribe();
      this.gpsSub = undefined;
      console.log("Arrêt du suivi GPS.");
    }
  }

  updateAndSendPosition() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (this.map && this.marker) {
          this.marker.setLatLng([lat, lng]);
          this.activityService.updateLocalPosition(lat, lng);
        }

         
        const actId = this.currentActivityId; 
        
        if (actId) {
            this.interventionService.addPosition(actId, lat, lng).subscribe({
                next: () => console.log(`GPS sync OK (${lat}, ${lng})`),
                error: (err) => console.warn('Erreur envoi GPS', err)
            });
        }
      },
      (err) => console.warn('Impossible de récupérer la position', err),
      { enableHighAccuracy: true }
    );
  }

  initMap() {
    const lat = this.activityService.lastPosition.lat || 45.1885;
    const lng = this.activityService.lastPosition.lng || 5.7245;

    this.map = L.map('container-carte').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.marker = L.marker([lat, lng]).addTo(this.map);
  }

  loadStations() {
    this.stationService.getStations().subscribe((data: any[]) => {
      this.stations = data;
      const saved = this.stationService.getStation();
      if(saved) this.selectedStationId = saved.id;
      else if(this.stations.length > 0) this.selectedStationId = this.stations[0].id;
      
      if(this.selectedStationId) setTimeout(()=> this.updateMap(), 100);
    });
  }

  updateMap() {
    if (!this.map) return;
    const station = this.stations.find(s => s.id == this.selectedStationId);
    if (!station) return;

    this.stationService.setStation(station);

    if(!this.isActivityRunning) {
        const lat = Number(station.latitude);
        const lng = Number(station.longitude);
        this.map.setView([lat, lng], 13);
        this.marker.setLatLng([lat, lng]);
        
        this.activityService.updateLocalPosition(lat, lng);
    }

    this.loadMeteo(station.nom);
  }

  loadMeteo(city: string) {
    this.meteoLoading = true;
    this.meteoService.getMeteo(city).subscribe({
      next: (data) => {
        this.meteo = data;
        this.meteoLoading = false;
      },
      error: () => this.meteoLoading = false
    });
  }

  translateCondition(cond: string) {
    return this.meteoService.translateCondition(cond);
  } 
  
  startActivity() {
    if (!this.selectedStationId || !this.user) return;
    this.activityService.startActivity(this.user.id, this.selectedStationId);
  }

  stopActivity() {
    this.activityService.stopActivity();
  }

  toggleAlert() {
    this.activityService.toggleAlert();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}