import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router'; // Retrait de RouterLinkActive
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-compte',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Retrait ici aussi
  templateUrl: './compte.html',
  styleUrl: './compte.scss',
})
export class Compte implements OnInit {
  user: any = {};
  message = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    const id = this.auth.getUserId();
    if (!id) return;
    
    this.http.get<any>(`/api/users/${id}`).subscribe(res => {
      if (res.success) {
        this.user = res.data; 
        if (this.user.date_naissance) {
          this.user.date_naissance = this.user.date_naissance.split('T')[0];
        }
      }
    });
  }

  save() {
    const id = this.auth.getUserId();
    this.http.put(`/api/users/${id}`, this.user).subscribe({
      next: () => this.message = 'Modifications enregistrées !',
      error: () => this.message = 'Erreur lors de la sauvegarde.'
    });
  }
}