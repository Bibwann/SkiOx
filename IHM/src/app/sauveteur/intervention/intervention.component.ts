import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { InterventionService, Intervention } from '../../services/intervention.service';
import { StationService } from '../../services/station.service';
import { timer, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-intervention',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './intervention.component.html',
  styleUrls: ['./intervention.component.scss']
})
export class InterventionComponent implements OnInit, OnDestroy {
  user: any;
  interventions: Intervention[] = [];
  currentStationId: number | null = null;
  private pollSub: Subscription | null = null;

  constructor(
      private auth: AuthService, 
      private service: InterventionService,
      private stationService: StationService
  ) {
    this.user = this.auth.getUser();
  }

  ngOnInit(): void { 
    this.stationService.station$.subscribe(station => {
      if (station) {
        this.currentStationId = station.id;
        this.loadInterventions();
      }
    });
 
    this.startPolling();
  }

  ngOnDestroy() {
      if (this.pollSub) {
          this.pollSub.unsubscribe();
      }
  }

  loadInterventions() {
    if (!this.currentStationId) return;
    
    this.service.getInterventionsByStation(this.currentStationId).subscribe(
      (data: Intervention[]) => {
        this.interventions = data;
      },
      (error: any) => {
        console.error('Erreur chargement interventions', error);
      }
    );
  }

  startPolling() {
    this.pollSub = timer(0, 15000).pipe(
        switchMap(() => {
            if (this.currentStationId) {
                return this.service.getInterventionsByStation(this.currentStationId);
            }
            return [];
        })
    ).subscribe((data: Intervention[]) => {
        if (data.length > 0) {
            this.interventions = data;
        }
    });
  }
 
  get ongoing() { 
      return this.interventions.filter(i => i.status === 'ongoing'); 
  }
  
  get past() { 
      return this.interventions.filter(i => i.status === 'past'); 
  }
}