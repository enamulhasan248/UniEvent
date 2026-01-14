import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventService } from '../../../core/services/event';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent implements OnInit {
  private eventService = inject(EventService);

  featuredEvents: any[] = [];
  allEvents: any[] = [];

  ngOnInit() {
    this.eventService.getFeaturedEvents().subscribe(res => this.featuredEvents = res);
    this.eventService.getEvents().subscribe(res => this.allEvents = res);
  }
}
