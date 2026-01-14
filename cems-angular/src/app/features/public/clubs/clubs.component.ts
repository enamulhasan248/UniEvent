import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { EventService } from '../../../core/services/event';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="container">
      <h2 class="section-title">Student Clubs</h2>
      <div class="grid">
        <mat-card *ngFor="let club of clubs" class="card">
          <mat-card-header>
            <mat-card-title>{{club.name}}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{club.description}}</p>
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
  `]
})
export class ClubsComponent implements OnInit {
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);
  clubs: any[] = [];

  ngOnInit() {
    this.eventService.getClubs().subscribe({
      next: (res) => {
        this.clubs = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
}
