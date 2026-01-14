import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { OrganizerService } from '../../../core/services/organizer';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [
    CommonModule,
    ZXingScannerModule,
    MatSnackBarModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './qr-scanner.html',
  styleUrls: ['./qr-scanner.scss']
})
export class QrScannerComponent {
  private organizerService = inject(OrganizerService);
  private snackBar = inject(MatSnackBar);

  scanResult: string = '';
  isScanning: boolean = true;

  onCodeResult(resultString: string) {
    if (!this.isScanning) return;

    this.scanResult = resultString;
    this.isScanning = false; // Stop scanning temporarily

    // Parse ticket ID from QR data (assuming format "CEMS-TICKET:ID")
    let ticketId = resultString;
    if (resultString.startsWith('CEMS-TICKET:')) {
      ticketId = resultString.split(':')[1];
    }

    this.organizerService.verifyTicket(ticketId).subscribe({
      next: (res) => {
        this.snackBar.open(`Valid Ticket! User: ${res.user_email}`, 'OK', { duration: 5000, panelClass: ['success-snackbar'] });
      },
      error: (err) => {
        this.snackBar.open(`Invalid Ticket: ${err.error.detail || 'Unknown Error'}`, 'Retry', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  resetScanner() {
    this.isScanning = true;
    this.scanResult = '';
  }
}
