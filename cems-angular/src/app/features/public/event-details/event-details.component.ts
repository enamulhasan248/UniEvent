import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventService } from '../../../core/services/event';
import { AuthService } from '../../../core/services/auth';

@Component({
    selector: 'app-event-details',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule, RouterModule],
    templateUrl: './event-details.component.html',
    styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private eventService = inject(EventService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);
    private snackBar = inject(MatSnackBar);

    event: any = null;
    loading = true;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadEvent(id);
        }
    }

    loadEvent(id: string) {
        this.eventService.getEvent(id).subscribe({
            next: (res) => {
                this.event = res;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    register() {
        if (!this.authService.isAuthenticated()) {
            this.snackBar.open('Please login to register', 'Close', { duration: 3000 });
            return;
        }

        if (this.event) {
            this.eventService.register(this.event.id).subscribe({
                next: (res) => {
                    this.snackBar.open('Registration Successful!', 'Close', { duration: 3000 });
                    // Reload to update stats if needed, or just show success
                },
                error: (err) => {
                    this.snackBar.open(err.error.detail || 'Registration Failed', 'Close', { duration: 3000 });
                }
            });
        }
    }
}
