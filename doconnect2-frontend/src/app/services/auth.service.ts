import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('user');
    if (stored) this.currentUserSubject.next(JSON.parse(stored));
  }

  register(data: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(user => this.setUser(user))
    );
  }

  login(data: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(user => this.setUser(user))
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'Admin';
  }

  private setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}