import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

export type UserRole = 'sauveteur' | 'sportif' | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'skiox_auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<boolean> {
    console.log('Calling API login with:', username);
    return this.http.post<any>('/api/login', { username, password }).pipe(
      tap(response => {
        if (response.success) {
          const payload = { role: response.data.role, user: response.data, ts: Date.now() };
          localStorage.setItem(this.KEY, JSON.stringify(payload));
        }
      }),
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  loginLocal(role: UserRole) {
    const payload = { role, user: { id: 999, nom: 'Test', prenom: 'User' }, ts: Date.now() };
    localStorage.setItem(this.KEY, JSON.stringify(payload));
  }

  register(userData: any): Observable<boolean> {
    return this.http.post<any>('/api/users', userData).pipe(
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  logout() {
    localStorage.removeItem(this.KEY);
  }

  isLoggedIn(): boolean {
    return this.getRole() !== null;
  }

  getRole(): UserRole {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return obj?.role ?? null;
    } catch {
      return null;
    }
  }

  getUser(): any {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return obj?.user ?? null;
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    const user = this.getUser();
    return user?.id ?? null;
  }

  getUserFirstName(): string | null {
    const user = this.getUser();
    return user?.prenom ?? null;
  }
}
