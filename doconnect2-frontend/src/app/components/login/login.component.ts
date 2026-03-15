import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="form-box">
      <h2>Welcome back</h2>
      <p class="subtitle">Login to your DoConnect account</p>

      <div class="field">
        <label>Email</label>
        <input type="email" placeholder="Enter email" [(ngModel)]="email"
          [class.invalid]="submitted && !isValidEmail()" />
        <span class="err" *ngIf="submitted && !email">Email is required</span>
        <span class="err" *ngIf="submitted && email && !isValidEmail()">Enter a valid email</span>
      </div>

      <div class="field">
        <label>Password</label>
        <input type="password" placeholder="Enter password" [(ngModel)]="password"
          [class.invalid]="submitted && !password" />
        <span class="err" *ngIf="submitted && !password">Password is required</span>
      </div>

      <div class="error" *ngIf="error">{{ error }}</div>
      <button (click)="login()" [disabled]="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <p class="link">Don't have an account? <a routerLink="/register">Register</a></p>
    </div>
  `,
  styles: [`
    .form-box {
      max-width: 420px;
      margin: 50px auto;
      padding: 36px;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      background: #fff;
    }
    h2 { margin: 0 0 6px; font-size: 24px; }
    .subtitle { color: #888; margin: 0 0 24px; font-size: 14px; }
    .field { margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #444; }
    input {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 15px;
      transition: border 0.2s;
    }
    input:focus { outline: none; border-color: #7c6af7; }
    input.invalid { border-color: #e53e3e; }
    .err { color: #e53e3e; font-size: 12px; margin-top: 4px; display: block; }
    .error {
      background: #fff5f5;
      color: #e53e3e;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 14px;
      font-size: 14px;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #7c6af7;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover:not(:disabled) { background: #6355e0; }
    button:disabled { background: #b0a8f5; cursor: not-allowed; }
    .link { margin-top: 16px; text-align: center; font-size: 14px; color: #666; }
    .link a { color: #7c6af7; text-decoration: none; font-weight: 500; }
    @media (max-width: 480px) {
      .form-box { margin: 20px 16px; padding: 24px; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  submitted = false;

  constructor(private auth: AuthService, private router: Router) {}

  isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  login() {
    this.submitted = true;
    this.error = '';

    if (!this.email || !this.isValidEmail() || !this.password) {
      return;
    }

    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        if (user.role === 'Admin') this.router.navigate(['/admin']);
        else this.router.navigate(['/']);
      },
      error: () => {
        this.error = 'Invalid email or password.';
        this.loading = false;
      }
    });
  }
}