import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <nav *ngIf="authService.isLoggedIn()">
      <button routerLink="/">Converter</button>
      <button routerLink="/history">History</button>
      <button (click)="logout()">Logout</button>
    </nav>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    nav {
      padding: 1rem;
      background: #f5f5f5;
      display: flex;
      gap: 1rem;
    }
    button {
      padding: 0.5rem 1rem;
    }
    main {
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }
} 