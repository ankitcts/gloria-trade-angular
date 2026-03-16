import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ApiService } from '../../../core/api/api.service';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { AuthState } from '../../../core/auth/auth.state';

export interface OtpDialogData {
  title: string;
  message: string;
  purpose: 'cancel_order' | 'approve_transfer' | 'verify_action';
  actionLabel?: string;
}

@Component({
  selector: 'app-otp-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRadioModule,
  ],
  template: `
    <div class="otp-dialog">
      <div class="dialog-header">
        <mat-icon class="header-icon">verified_user</mat-icon>
        <h2>{{ data.title }}</h2>
        <p class="dialog-message">{{ data.message }}</p>
      </div>

      @if (step() === 'input') {
        <!-- Step 1: Enter email/phone to receive OTP -->
        <div class="step-content">
          <p class="step-label">Choose verification method:</p>
          <mat-radio-group [(ngModel)]="method" class="method-group">
            <mat-radio-button value="email">Email</mat-radio-button>
            <mat-radio-button value="phone" disabled>Mobile (coming soon)</mat-radio-button>
          </mat-radio-group>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput [(ngModel)]="destination" type="email" placeholder="you@example.com" />
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <div class="dialog-actions">
            <button mat-button (click)="dialogRef.close(false)" class="cancel-btn">Cancel</button>
            <button mat-raised-button color="primary" (click)="sendOtp()" [disabled]="sending() || !destination">
              @if (sending()) {
                <mat-spinner diameter="18"></mat-spinner>
              } @else {
                Send OTP
              }
            </button>
          </div>
        </div>
      }

      @if (step() === 'verify') {
        <!-- Step 2: Enter OTP code -->
        <div class="step-content">
          <p class="otp-sent-msg">
            <mat-icon>check_circle</mat-icon>
            OTP sent to <strong>{{ maskedDestination() }}</strong>
          </p>
          @if (devOtp()) {
            <div class="dev-otp-hint">
              Dev mode OTP: <strong>{{ devOtp() }}</strong>
            </div>
          }

          <mat-form-field appearance="outline" class="full-width otp-field">
            <mat-label>Enter 6-digit OTP</mat-label>
            <input matInput [(ngModel)]="otpCode" maxlength="6" placeholder="000000"
                   class="otp-input" (keyup.enter)="verifyOtp()" />
            <mat-icon matPrefix>lock</mat-icon>
          </mat-form-field>

          <div class="timer-row">
            <span class="timer">Expires in {{ expiresIn() }}s</span>
            <button mat-button (click)="sendOtp()" [disabled]="sending()" class="resend-btn">
              Resend OTP
            </button>
          </div>

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <div class="dialog-actions">
            <button mat-button (click)="step.set('input')" class="cancel-btn">Back</button>
            <button mat-raised-button color="primary" (click)="verifyOtp()"
                    [disabled]="verifying() || otpCode.length < 6">
              @if (verifying()) {
                <mat-spinner diameter="18"></mat-spinner>
              } @else {
                {{ data.actionLabel || 'Confirm' }}
              }
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .otp-dialog { padding: 8px; min-width: 380px; }
    .dialog-header { text-align: center; margin-bottom: 20px; }
    .header-icon { font-size: 40px; width: 40px; height: 40px; color: var(--gt-primary, #2962ff); margin-bottom: 8px; }
    .dialog-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--gt-text-primary, #d1d4dc); }
    .dialog-message { color: var(--gt-text-secondary, #787b86); font-size: 14px; margin: 8px 0 0; }
    .step-content { display: flex; flex-direction: column; gap: 12px; }
    .step-label { font-size: 13px; color: var(--gt-text-secondary, #787b86); margin: 0; }
    .method-group { display: flex; gap: 24px; }
    .full-width { width: 100%; }
    .otp-field .otp-input { font-size: 24px; letter-spacing: 8px; text-align: center; font-weight: 600; }
    .otp-sent-msg { display: flex; align-items: center; gap: 8px; color: var(--gt-profit, #26a69a); font-size: 13px; margin: 0; }
    .otp-sent-msg mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .dev-otp-hint { background: rgba(41, 98, 255, 0.08); border: 1px dashed rgba(41, 98, 255, 0.3); padding: 8px 12px; border-radius: 6px; font-size: 12px; color: var(--gt-primary, #2962ff); text-align: center; }
    .timer-row { display: flex; justify-content: space-between; align-items: center; }
    .timer { font-size: 12px; color: var(--gt-text-muted, #4c525e); }
    .resend-btn { font-size: 12px; }
    .error-msg { background: var(--gt-loss-bg, rgba(239,83,80,0.12)); color: var(--gt-loss, #ef5350); padding: 8px 12px; border-radius: 6px; font-size: 13px; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .cancel-btn { color: var(--gt-text-secondary, #787b86); }
  `],
})
export class OtpDialogComponent {
  readonly dialogRef = inject(MatDialogRef<OtpDialogComponent>);
  readonly data: OtpDialogData = inject(MAT_DIALOG_DATA);
  private readonly api = inject(ApiService);
  private readonly authState = inject(AuthState);

  method = 'email';
  destination = '';
  otpCode = '';

  step = signal<'input' | 'verify'>('input');
  sending = signal(false);
  verifying = signal(false);
  error = signal('');
  maskedDestination = signal('');
  devOtp = signal('');
  expiresIn = signal(300);

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Pre-fill email from logged-in user
    const user = this.authState.user();
    if (user?.email) {
      this.destination = user.email;
    }
  }

  sendOtp(): void {
    if (!this.destination) return;
    this.sending.set(true);
    this.error.set('');

    this.api
      .post<{ message: string; expires_in: number; dev_otp?: string }>(ENDPOINTS.OTP.SEND, {
        destination: this.destination,
        purpose: this.data.purpose,
      })
      .subscribe({
        next: (res) => {
          this.sending.set(false);
          this.maskedDestination.set(res.message.replace('OTP sent to ', ''));
          this.devOtp.set(res.dev_otp || '');
          this.expiresIn.set(res.expires_in);
          this.step.set('verify');
          this.otpCode = '';
          this.startTimer();
        },
        error: (err) => {
          this.sending.set(false);
          this.error.set(err.error?.detail || 'Failed to send OTP');
        },
      });
  }

  verifyOtp(): void {
    if (this.otpCode.length < 6) return;
    this.verifying.set(true);
    this.error.set('');

    this.api
      .post<{ verified: boolean }>(ENDPOINTS.OTP.VERIFY, {
        code: this.otpCode,
        purpose: this.data.purpose,
      })
      .subscribe({
        next: () => {
          this.verifying.set(false);
          this.stopTimer();
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.verifying.set(false);
          this.error.set(err.error?.detail || 'Invalid OTP');
        },
      });
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.expiresIn.update((v) => {
        if (v <= 1) {
          this.stopTimer();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
