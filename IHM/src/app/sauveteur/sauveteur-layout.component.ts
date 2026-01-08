import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SauveteurNavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-sauveteur-layout',
  standalone: true,
  imports: [RouterOutlet, SauveteurNavbarComponent],
  template: `
    <div class="sauveteur-layout">
      <app-sauveteur-navbar></app-sauveteur-navbar>
      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .sauveteur-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .content {
      flex: 1;
      padding: 20px;
      background-color: #ecf0f1;
    }
  `]
})
export class SauveteurLayoutComponent {
}
