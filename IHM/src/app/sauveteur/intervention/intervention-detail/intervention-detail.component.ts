import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { InterventionService } from '../../../services/intervention.service';
import * as L from 'leaflet';
import { interval, Subscription, switchMap, startWith, map, catchError, of } from 'rxjs';

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
  selector: 'app-intervention-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './intervention-detail.component.html',
  styleUrls: ['./intervention-detail.component.scss']
})
export class InterventionDetailComponent implements OnInit, OnDestroy {
  id: number = 0;
  victime: any = null;
  isLoading = true;  
  errorStatus = false;  
  
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private polyline: L.Polyline | undefined;

  isPast = false;
  
  private pollSub: Subscription | undefined;
  public elapsed$ = interval(1000).pipe(map(() => this.getElapsedTime()));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: InterventionService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
 
      this.pollSub = interval(2000).pipe(
        startWith(0),
        switchMap(() => 
          this.service.getDetails(this.id).pipe( 
            catchError(err => {
              console.warn('Erreur de récupération (sera réessayé dans 2s):', err);
              this.errorStatus = true;  
              return of(null); 
            })
          )
        )
      ).subscribe({
        next: (data) => {
          if (data) {
            this.errorStatus = false; 
            this.isLoading = false;
            this.updateData(data);
          }
           
        },
        error: (err) => { 
          console.error('Erreur fatale du polling', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.pollSub) this.pollSub.unsubscribe();
    if (this.map) this.map.remove();
  }

 updateData(data: any) {
    console.log('Données reçues dans le composant:', data);  

    this.isPast = (data.status === 'past' || data.status === 'finished');

    const info = data.intervention_secours;
    if (info && info.victime) {
      console.log('Victime chargée:', info.victime);  
      this.victime = info.victime;
      this.isLoading = false;
      
      if (!this.map) {
        setTimeout(() => this.initMap(), 100);
      } else {
        this.updateMap();
      }
    } else {
      console.warn('Pas de victime trouvée dans les données reçues !');
    }
  }

  initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const lat = this.victime?.coordonnees_gps?.latitude || 44.1865;
    const lng = this.victime?.coordonnees_gps?.longitude || 7.1565;

    this.map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.updateMap();
  }

  updateMap() {
    if (!this.map || !this.victime) return;

    if (this.victime.coordonnees_gps) {
      const lat = this.victime.coordonnees_gps.latitude;
      const lng = this.victime.coordonnees_gps.longitude;

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        const redIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #dc3545; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        this.marker = L.marker([lat, lng], { icon: redIcon })
          .addTo(this.map)
          .bindPopup(`<b>${this.victime.prenom} ${this.victime.nom}</b><br>Position actuelle`);
      }
    }
 
    if (this.victime.trace && this.victime.trace.length > 0) { 
      const tracePoints = this.victime.trace
        .filter((t: any) => t && t.lat && t.lng)
        .map((t: any) => [t.lat, t.lng] as [number, number]);
      
      if (this.polyline) {
        this.polyline.setLatLngs(tracePoints);
      } else {
        this.polyline = L.polyline(tracePoints, { color: 'red', weight: 4, opacity: 0.7 }).addTo(this.map);
      }
    }
  }

  confirmFinish(): void {
    if (confirm("Confirmez-vous la fin de cette intervention ?")) {
      this.service.finishIntervention(this.id).subscribe(() => {
        this.router.navigate(['/sauveteur/intervention']);
      });
    }
  }

  getElapsedTime(): string {
    if (!this.victime?.heure_debut) return '00:00:00';
    try {
      const start = new Date(this.victime.heure_debut).getTime();
      const now = Date.now();
      if (isNaN(start)) return '00:00:00'; 

      const diff = Math.max(0, now - start);
      
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)));

      return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    } catch (e) {
      return '00:00:00';
    }
  }

  private pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }
}