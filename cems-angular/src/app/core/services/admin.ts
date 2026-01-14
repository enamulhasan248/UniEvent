import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000';

  getStats() {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`);
  }

  getUsers() {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`);
  }

  updateUserRole(userId: string, role: string) {
    return this.http.put<any>(`${this.apiUrl}/admin/users/${userId}/role`, { role });
  }

  getClubs() {
    return this.http.get<any[]>(`${this.apiUrl}/clubs`);
  }

  createClub(data: any) {
    return this.http.post<any>(`${this.apiUrl}/clubs`, data);
  }

  updateClub(clubId: string, data: any) {
    return this.http.put<any>(`${this.apiUrl}/clubs/${clubId}`, data);
  }

  getVenues() {
    return this.http.get<any[]>(`${this.apiUrl}/venues`);
  }

  createVenue(data: any) {
    return this.http.post<any>(`${this.apiUrl}/venues`, data);
  }

  updateVenue(venueId: string, data: any) {
    return this.http.put<any>(`${this.apiUrl}/venues/${venueId}`, data);
  }
}
