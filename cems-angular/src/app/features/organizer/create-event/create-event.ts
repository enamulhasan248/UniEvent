import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrganizerService } from '../../../core/services/organizer';

@Component({
    selector: 'app-create-event',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule
    ],
    templateUrl: './create-event.html',
    styleUrls: ['./create-event.scss']
})
export class CreateEventComponent implements OnInit {
    private fb = inject(FormBuilder);
    private organizerService = inject(OrganizerService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private snackBar = inject(MatSnackBar);

    clubs: any[] = [];
    venues: any[] = [];
    isEditMode = false;
    eventId: string | null = null;

    basicForm = this.fb.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
        club_id: ['', Validators.required]
    });

    logisticsForm = this.fb.group({
        venue_id: ['', Validators.required],
        start_time: ['', Validators.required],
        end_time: ['', Validators.required],
        max_attendees: [0, [Validators.required, Validators.min(1)]]
    });

    ngOnInit() {
        this.organizerService.getClubs().subscribe(res => this.clubs = res);
        this.organizerService.getVenues().subscribe(res => this.venues = res);

        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.eventId = params['id'];
                this.loadEventData(this.eventId!);
            }
        });
    }

    loadEventData(id: string) {
        this.organizerService.getEvent(id).subscribe(event => {
            this.basicForm.patchValue({
                title: event.title,
                description: event.description,
                club_id: event.club_id
            });
            this.logisticsForm.patchValue({
                venue_id: event.venue_id,
                start_time: event.start_time,
                end_time: event.end_time,
                max_attendees: event.max_attendees
            });
        });
    }

    submit() {
        if (this.basicForm.valid && this.logisticsForm.valid) {
            const eventData = {
                ...this.basicForm.value,
                ...this.logisticsForm.value,
            };

            if (this.isEditMode && this.eventId) {
                this.organizerService.updateEvent(this.eventId, eventData).subscribe({
                    next: () => {
                        this.snackBar.open('Event Updated Successfully!', 'Close', { duration: 3000 });
                        this.router.navigate(['/organizer/dashboard']);
                    },
                    error: (err) => {
                        this.snackBar.open('Error updating event: ' + (err.error.detail || 'Unknown error'), 'Close', { duration: 3000 });
                    }
                });
            } else {
                this.organizerService.createEvent(eventData).subscribe({
                    next: () => {
                        this.snackBar.open('Event Created Successfully!', 'Close', { duration: 3000 });
                        this.router.navigate(['/organizer/dashboard']);
                    },
                    error: (err) => {
                        this.snackBar.open('Error creating event: ' + (err.error.detail || 'Unknown error'), 'Close', { duration: 3000 });
                    }
                });
            }
        }
    }
}
