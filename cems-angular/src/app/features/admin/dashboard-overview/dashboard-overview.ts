import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../../core/services/admin';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard-overview.html',
  styleUrls: ['./dashboard-overview.scss']
})
export class DashboardOverviewComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  stats: any = {
    total_users: 0,
    total_events: 0,
    total_clubs: 0,
    total_venues: 0
  };

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (res) => {
        console.log('Stats loaded:', res);
        this.stats = res;
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });
  }
}
