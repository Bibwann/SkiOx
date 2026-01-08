import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SauveteurRoutingModule } from './sauveteur-routing.module';

import { ParametreComponent } from './parametre/parametre.component';
import { InterventionComponent } from './intervention/intervention.component';
import { StationComponent } from './station/station.component';
import { SauveteurNavbarComponent } from './navbar/navbar.component';
import { SauveteurLayoutComponent } from './sauveteur-layout.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SauveteurRoutingModule,
    ParametreComponent,
    InterventionComponent,
    StationComponent,
    SauveteurNavbarComponent,
    SauveteurLayoutComponent
  ]
})
export class SauveteurModule { }
