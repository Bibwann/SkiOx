import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-carte',
  standalone: true,
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.scss']
})
export class CarteComponent {
  user: any;

  constructor(private auth: AuthService) {
    this.user = this.auth.getUser();
  }
}
