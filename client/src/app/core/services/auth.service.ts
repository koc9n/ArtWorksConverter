import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

interface User {
  id: string;
  email: string;
  createdAt: Date;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private token = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  private user = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  constructor(private http: HttpClient) {
    this.validateTokenOnStartup();
  }

  login(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`, 
      { email }
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.token.next(response.token);
        this.user.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => this.clearSession())
      );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  validateToken(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/validate`)
      .pipe(
        tap(user => {
          this.user.next(user);
          localStorage.setItem('user', JSON.stringify(user));
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          this.clearSession();
          throw error;
        })
      );
  }

  getToken(): string | null {
    return this.token.value;
  }

  getUser(): User | null {
    return this.user.value;
  }

  isLoggedIn(): boolean {
    return !!this.token.value;
  }

  clearToken(): void {
    this.clearSession();
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.next(null);
    this.user.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private validateTokenOnStartup(): void {
    const token = this.getToken();
    if (token) {
      this.validateToken().subscribe({
        error: () => {
          // If token validation fails, clear everything
          this.clearSession();
        }
      });
    }
  }

  checkAuthStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return of(false);
    }

    // Let the interceptor handle the token
    return this.http.get<boolean>(`${environment.apiUrl}/auth/validate`).pipe(
      tap(isValid => {
        this.isAuthenticatedSubject.next(isValid);
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }
} 