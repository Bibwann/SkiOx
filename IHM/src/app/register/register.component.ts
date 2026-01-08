import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  nom = '';
  prenom = '';
  sexe = true;
  date_naissance = '';
  password = '';
  role = '1';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    if (!this.nom || !this.prenom || !this.date_naissance || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    const userData = {
      nom: this.nom,
      prenom: this.prenom,
      sexe: this.sexe,
      date_naissance: this.date_naissance,
      password: this.password,
      id_roles: parseInt(this.role, 10)
    };

    this.auth.register(userData).subscribe(success => {
      if (success) {
        this.router.navigate(['/login']);
      } else {
        this.error = 'Erreur lors de l\'inscription';
      }
    });
  }
}
