import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-login',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Login</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput 
                   type="email" 
                   placeholder="Enter your email"
                   formControlName="email">
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>
          
          <button mat-raised-button 
                  color="primary" 
                  type="submit"
                  [disabled]="!loginForm.valid || isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `]
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const email = this.loginForm.value.email!;
      
      console.log('Attempting login with:', email);
      
      this.authService.login(email)
        .subscribe({
          next: (response) => {
            console.log('Login successful:', response);
            this.router.navigate(['/converter']);
            this.notificationService.success('Login successful');
          },
          error: (error) => {
            console.error('Login failed:', error);
            this.notificationService.error(
              error.error?.message || 'Login failed. Please try again.'
            );
            this.isLoading = false;
          }
        });
    }
  }
} 