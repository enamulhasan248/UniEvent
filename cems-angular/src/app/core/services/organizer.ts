import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrganizerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000';

  getEvents() {
    // This endpoint returns the list of events with their individual stats
    return this.http.get<any[]>(`${this.apiUrl}/organizer/events/stats`);
  }

  getClubs() {
    return this.http.get<any[]>(`${this.apiUrl}/clubs`);
  }

  getVenues() {
    return this.http.get<any[]>(`${this.apiUrl}/venues`);
  }

  createEvent(data: any) {
    return this.http.post<any>(`${this.apiUrl}/organizer/events`, data);
  }

  updateEvent(id: string, data: any) {
    return this.http.put<any>(`${this.apiUrl}/organizer/events/${id}`, data);
  }

  getEvent(id: string) {
    return this.http.get<any>(`${this.apiUrl}/events/${id}`);
  }

  getEventStats() {
    // This endpoint returns the global dashboard counters
    return this.http.get<any>(`${this.apiUrl}/organizer/dashboard-stats`);
  }

  verifyTicket(ticketId: string) {
    return this.http.post<any>(`${this.apiUrl}/organizer/verify-ticket`, { ticket_id: ticketId });
  }
}
