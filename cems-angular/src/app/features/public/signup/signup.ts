import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatStepperModule
  ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  signupForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9_.+-]+@.*\.ewubd\.edu$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]]
  });

  isOtpSent = false;

  requestOtp() {
    if (this.signupForm.valid) {
      this.authService.requestOtp(this.signupForm.value).subscribe({
        next: () => {
          this.isOtpSent = true;
          this.snackBar.open('OTP sent to your email!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Error: ' + (err.error.detail || 'Failed to send OTP'), 'Close', { duration: 3000 });
        }
      });
    }
  }

  verifyAndSignup() {
    if (this.otpForm.valid) {
      const data = {
        email: this.signupForm.value.email,
        otp: this.otpForm.value.otp
      };

      // Note: The backend expects query params for verify endpoint based on my previous analysis
      // But let's check the service implementation. 
      // AuthService.signup uses params: data. 
      // Backend: @app.post("/auth/signup/verify") def verify_signup(email: str, otp: str)

      this.authService.signup(data).subscribe({
        next: () => {
          this.snackBar.open('Account Created! Please Login.', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.snackBar.open('Signup Failed: ' + (err.error.detail || 'Invalid OTP'), 'Close', { duration: 3000 });
        }
      });
    }
  }
}
