import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { OrganizerService } from '../../../core/services/organizer';

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './event-management.html',
  styleUrls: ['./event-management.scss']
})
export class EventManagementComponent implements OnInit {
  private organizerService = inject(OrganizerService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  displayedColumns: string[] = ['title', 'date', 'capacity', 'registrations', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  stats: any = {};

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.organizerService.getEvents().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.dataSource.data = res;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => console.error(err)
    });

    this.organizerService.getEventStats().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.stats = res;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => console.error(err)
    });
  }

  editEvent(event: any) {
    this.router.navigate(['/organizer/create-event'], { queryParams: { id: event.id } });
  }
}
