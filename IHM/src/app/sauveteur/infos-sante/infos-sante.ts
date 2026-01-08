import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-infos-sante-sauveteur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './infos-sante.html',
  styleUrls: ['./infos-sante.scss']
})
export class InfosSanteComponent implements OnInit {
  user: any = {};
  message = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const id = this.auth.getUserId();
    if (id) {
      this.http.get<any>(`/api/users/${id}`).subscribe(res => {
        if (res.success) this.user = res.data;
      });
    }
  }

  save() {
    const id = this.auth.getUserId();
    this.http.put(`/api/users/${id}`, this.user).subscribe({
      next: () => this.message = 'Informations santé mises à jour !',
      error: () => this.message = 'Erreur sauvegarde.'
    });
  }
}