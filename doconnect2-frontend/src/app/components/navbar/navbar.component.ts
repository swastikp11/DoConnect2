import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { FavouriteService } from '../../services/favourite.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="brand">DoConnect</a>
      <div class="links">
        <a routerLink="/">Home</a>
        <ng-container *ngIf="auth.isLoggedIn(); else guestLinks">
          <a routerLink="/ask" *ngIf="!auth.isAdmin()">Ask Question</a>
          <a routerLink="/favourites" *ngIf="!auth.isAdmin()" class="fav-link">
            &#9825; Favourites
            <span class="fav-badge" *ngIf="favCount > 0">{{ favCount }}</span>
          </a>
          <a routerLink="/admin" *ngIf="auth.isAdmin()" class="admin-link">
            Admin
            <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </a>
          <span class="username">{{ auth.getUser()?.username }}</span>
          <button (click)="logout()">Logout</button>
        </ng-container>
        <ng-template #guestLinks>
          <a routerLink="/login">Login</a>
          <a routerLink="/register" class="register-btn">Register</a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 32px;
      background: #1e1e2e;
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .brand { font-size: 22px; font-weight: 700; color: #7c6af7; text-decoration: none; letter-spacing: -0.5px; }
    .links { display: flex; align-items: center; gap: 20px; }
    .links a { color: #ccc; text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .links a:hover { color: white; }
    .admin-link { position: relative; display: flex; align-items: center; gap: 6px; }
    .fav-link { position: relative; display: flex; align-items: center; gap: 6px; color: #f9a8d4 !important; }
    .notif-badge {
      background: #e53e3e; color: white; border-radius: 50%;
      width: 18px; height: 18px; display: flex; align-items: center;
      justify-content: center; font-size: 11px; font-weight: 700;
    }
    .fav-badge {
      background: #ec4899; color: white; border-radius: 50%;
      width: 18px; height: 18px; display: flex; align-items: center;
      justify-content: center; font-size: 11px; font-weight: 700;
    }
    .username { color: #7c6af7; font-weight: 500; font-size: 14px; }
    .register-btn { background: #7c6af7; color: white !important; padding: 6px 16px; border-radius: 8px; }
    .register-btn:hover { background: #6355e0; }
    button { background: transparent; color: #ccc; border: 1px solid #444; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    button:hover { background: #333; color: white; }
    @media (max-width: 600px) {
      .navbar { padding: 12px 16px; }
      .links { gap: 12px; }
      .links a { font-size: 13px; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  unreadCount = 0;
  favCount = 0;

  constructor(
    public auth: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private favouriteService: FavouriteService
  ) {}

  ngOnInit() {
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    this.favouriteService.favourites$.subscribe(ids => {
      this.favCount = ids.length;
    });
  }

  logout() {
    this.notificationService.stopConnection();
    this.notificationService.clearNotifications();
    this.auth.logout();
  }
}