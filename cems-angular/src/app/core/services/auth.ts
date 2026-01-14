import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://127.0.0.1:8000';

  currentUser = signal<any>(null);

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this.decodeAndSetUser(token);
    }
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        this.decodeAndSetUser(res.access_token);
      })
    );
  }

  signup(data: any) {
    return this.http.post(`${this.apiUrl}/auth/signup/verify`, null, { params: data });
  }

  requestOtp(data: any) {
    return this.http.post(`${this.apiUrl}/auth/signup/request-otp`, data);
  }

  getProfile() {
    return this.http.get<any>(`${this.apiUrl}/users/me`);
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRole() {
    return this.currentUser()?.role;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  private decodeAndSetUser(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      this.currentUser.set({
        email: decoded.sub,
        role: decoded.role,
        id: decoded.user_id
      });
    } catch (e) {
      this.logout();
    }
  }
}
