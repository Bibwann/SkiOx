import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SportifRoutingModule } from './sportif-routing.module';

import { CarteComponent } from './carte/carte.component';
import { ParametreComponent } from './parametre/parametre.component';
import { EquipementComponent } from './equipement/equipement.component';
import { SportifNavbarComponent } from './navbar/navbar.component';
import { SportifLayoutComponent } from './sportif-layout.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SportifRoutingModule,
    CarteComponent,
    ParametreComponent,
    EquipementComponent,
    SportifNavbarComponent,
    SportifLayoutComponent
  ]
})
export class SportifModule { }
