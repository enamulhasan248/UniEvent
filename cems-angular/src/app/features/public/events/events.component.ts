import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { EventService } from '../../../core/services/event';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
    private eventService = inject(EventService);
    private cdr = inject(ChangeDetectorRef);
    allEvents: any[] = [];

    ngOnInit() {
        this.eventService.getEvents().subscribe({
            next: (res) => {
                console.log('All Events loaded:', res);
                setTimeout(() => {
                    this.allEvents = res;
                    this.cdr.detectChanges();
                }, 0);
            },
            error: (err) => console.error('Error loading events:', err)
        });
    }
}
