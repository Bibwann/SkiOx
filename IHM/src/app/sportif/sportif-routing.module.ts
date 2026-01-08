import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SportifLayoutComponent } from './sportif-layout.component';

const routes: Routes = [
  {
    path: '',
    component: SportifLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'carte',
        loadComponent: () => import('./carte/carte.component').then(m => m.CarteComponent)
      },
      {
        path: 'parametre',
        loadComponent: () => import('./parametre/parametre.component').then(m => m.ParametreComponent)
      },
      {
        path: 'equipement',
        loadComponent: () => import('./equipement/equipement.component').then(m => m.EquipementComponent)
      },
      {
        path: 'compte',
        loadComponent: () =>
          import('./compte/compte').then(m => m.Compte)
      },
      {
        path: 'skiox',
        loadComponent: () =>
          import('./skiox/skiox').then(m => m.Skiox)
      },
      {
        path: 'infos-sante',
        loadComponent: () =>
          import('./infos-sante/infos-sante').then(m => m.InfosSante)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SportifRoutingModule { }
