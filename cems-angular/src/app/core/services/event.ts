import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000';

  getEvents() {
    return this.http.get<any[]>(`${this.apiUrl}/events`);
  }

  getFeaturedEvents() {
    return this.http.get<any[]>(`${this.apiUrl}/events/featured`);
  }

  getEvent(id: string) {
    return this.http.get<any>(`${this.apiUrl}/events/${id}`);
  }

  register(eventId: string) {
    return this.http.post<any>(`${this.apiUrl}/events/${eventId}/register`, {});
  }

  getVenues() {
    return this.http.get<any[]>(`${this.apiUrl}/venues`);
  }

  getClubs() {
    return this.http.get<any[]>(`${this.apiUrl}/clubs`);
  }
}
