import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SportifNavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-sportif-layout',
  standalone: true,
  imports: [RouterOutlet, SportifNavbarComponent],
  template: `
    <div class="sportif-layout">
      
      <div class="content">
        <router-outlet></router-outlet>
      </div>
      <app-sportif-navbar></app-sportif-navbar>
    </div>
  `,
  styles: [`
    .sportif-layout {
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
export class SportifLayoutComponent {
}
