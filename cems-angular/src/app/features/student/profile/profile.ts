import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QRCodeComponent } from 'angularx-qrcode';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    QRCodeComponent
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  user: any = null;
  selectedTicket: string = '';

  @ViewChild('qrDialog') qrDialog!: TemplateRef<any>;

  ngOnInit() {
    this.authService.getProfile().subscribe(res => {
      this.user = res;
    });
  }

  openQr(ticketId: string) {
    this.selectedTicket = ticketId;
    this.dialog.open(this.qrDialog);
  }
}
