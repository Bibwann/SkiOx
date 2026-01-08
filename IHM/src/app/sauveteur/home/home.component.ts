import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StationService } from '../../services/station.service';
import { MeteoService, MeteoData } from '../../services/meteo.service';
import { InterventionService } from '../../services/intervention.service';

interface Station {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: any;
  stations: Station[] = [];
  selectedStationId: number | null = null;
  meteo: MeteoData | null = null;
  meteoLoading = false;
 
  latestId: number | null = null;
  latestVictime: any = null;
  skiox = { battery: 92, armed: true };

  constructor(
    private auth: AuthService,
    private router: Router,
    private stationService: StationService,
    private meteoService: MeteoService,
    private interventionService: InterventionService
  ) {
    this.user = this.auth.getUser();
  }

  ngOnInit() {
    this.loadStations();
  }

  loadStations() {
    this.stationService.getStations().subscribe((data: any[]) => {
      this.stations = data;
      const saved = this.stationService.getStation(); 
      if (saved && this.stations.some(s => s.id === saved.id)) {
          this.selectedStationId = saved.id;
      } else if (this.stations.length > 0) {
          this.selectedStationId = this.stations[0].id;
      }
       
      if (this.selectedStationId) {
        this.onStationChange();
      }
    });
  }

  onStationChange() {
    if (!this.selectedStationId) return;
    const station = this.stations.find(s => s.id == this.selectedStationId);
    if (station) {
        this.stationService.setStation(station);
        this.loadMeteo(station.nom);
        this.checkAlerts(station.id);
    }
  }

  checkAlerts(stationId: number) { 
      this.interventionService.getInterventionsByStation(stationId).subscribe(list => {
          if (list && list.length > 0) {
              const alert = list[0];  
              this.latestId = alert.id;
              
               
              this.interventionService.getDetails(alert.id).subscribe(det => {
                  this.latestVictime = det.intervention_secours.victime;
              });
          } else {
              this.latestId = null;
              this.latestVictime = null;
          }
      });
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

  toggleArm() {
      this.skiox.armed = !this.skiox.armed;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}