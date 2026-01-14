import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin';

@Component({
  selector: 'app-resource-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './resource-management.html',
  styleUrls: ['./resource-management.scss']
})
export class ResourceManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  clubs: any[] = [];
  venues: any[] = [];

  clubForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    president_email: ['', [Validators.required, Validators.email]]
  });

  venueForm = this.fb.group({
    name: ['', Validators.required],
    capacity: [0, Validators.required],
    location: ['', Validators.required]
  });

  @ViewChild('clubDialog') clubDialog!: TemplateRef<any>;
  @ViewChild('venueDialog') venueDialog!: TemplateRef<any>;

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.adminService.getClubs().subscribe(res => this.clubs = res);
    this.adminService.getVenues().subscribe(res => this.venues = res);
  }

  openClubDialog() {
    this.clubForm.reset();
    this.dialog.open(this.clubDialog);
  }

  openVenueDialog() {
    this.venueForm.reset();
    this.dialog.open(this.venueDialog);
  }

  submitClub() {
    if (this.clubForm.valid) {
      this.adminService.createClub(this.clubForm.value).subscribe({
        next: () => {
          this.snackBar.open('Club Created', 'Close', { duration: 2000 });
          this.dialog.closeAll();
          this.loadResources();
        },
        error: () => this.snackBar.open('Error creating club', 'Close', { duration: 2000 })
      });
    }
  }

  submitVenue() {
    if (this.venueForm.valid) {
      this.adminService.createVenue(this.venueForm.value).subscribe({
        next: () => {
          this.snackBar.open('Venue Created', 'Close', { duration: 2000 });
          this.dialog.closeAll();
          this.loadResources();
        },
        error: () => this.snackBar.open('Error creating venue', 'Close', { duration: 2000 })
      });
    }
  }
}
