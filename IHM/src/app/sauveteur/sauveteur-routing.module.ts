
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SauveteurLayoutComponent } from './sauveteur-layout.component';

const routes: Routes = [
  {
    path: '',
    component: SauveteurLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'parametre',
        loadComponent: () => import('./parametre/parametre.component').then(m => m.ParametreComponent)
      },
      // Liste des interventions
      {
        path: 'intervention',
        loadComponent: () => import('./intervention/intervention.component').then(m => m.InterventionComponent)
      },
      // Détail d'une intervention     
      {
        path: 'intervention/:id',
        loadComponent: () =>
          import('./intervention/intervention-detail/intervention-detail.component')
            .then(m => m.InterventionDetailComponent)
      },
      {
        path: 'station',
        loadComponent: () => import('./station/station.component').then(m => m.StationComponent)
      },
      {
        path: 'compte',
        loadComponent: () =>
          import('./compte/compte').then(m => m.CompteComponent)
      },
      {
        path: 'skiox',
        loadComponent: () =>
          import('./skiox/skiox').then(m => m.Skiox)
      },
      {
        path: 'infos-sante',
        loadComponent: () =>
          import('./infos-sante/infos-sante').then(m => m.InfosSanteComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SauveteurRoutingModule { }
