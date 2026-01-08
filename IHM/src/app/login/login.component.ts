import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  private returnUrl = '/';

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService) {
    const q = this.route.snapshot.queryParamMap.get('returnUrl');
    if (q) this.returnUrl = q;
  }

  onSubmit() {
    this.error = '';
    const u = this.username?.trim();
    const p = this.password;

    if (!u || !p) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    // Backdoor pour tests locaux
    if (u === 'TOTO' && p === 'TOTO') {
      this.auth.loginLocal('sauveteur');
      this.router.navigateByUrl(this.returnUrl === '/' ? '/sauveteur' : this.returnUrl);
      return;
    }
    if (u === 'TITI' && p === 'TITI') {
      this.auth.loginLocal('sportif');
      this.router.navigateByUrl(this.returnUrl === '/' ? '/sportif' : this.returnUrl);
      return;
    }

    this.auth.login(u, p).subscribe(success => {
      if (success) {
        const role = this.auth.getRole();
        if (role === 'sauveteur') {
          this.router.navigateByUrl(this.returnUrl === '/' ? '/sauveteur' : this.returnUrl);
        } else if (role === 'sportif') {
          this.router.navigateByUrl(this.returnUrl === '/' ? '/sportif' : this.returnUrl);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      } else {
        this.error = 'Identifiants incorrects';
      }
    });
  }
}
