import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EventService } from '../../../core/services/event';

@Component({
  selector: 'app-venues',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="container">
      <h2 class="section-title">Campus Venues</h2>
      <div class="grid">
        <mat-card *ngFor="let venue of venues" class="card">
          <mat-card-header>
            <mat-icon mat-card-avatar>location_on</mat-icon>
            <mat-card-title>{{venue.name}}</mat-card-title>
            <mat-card-subtitle>Capacity: {{venue.capacity}}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Location:</strong> {{venue.location}}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .section-title { font-size: 2rem; margin-bottom: 20px; color: #333; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .card { height: 100%; }
    mat-icon { color: #f44336; }
  `]
})
export class VenuesComponent implements OnInit {
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);
  venues: any[] = [];

  ngOnInit() {
    this.eventService.getVenues().subscribe({
      next: (res) => {
        this.venues = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
}
