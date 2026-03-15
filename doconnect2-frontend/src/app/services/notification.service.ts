import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hubConnection: signalR.HubConnection | null = null;

  private notificationsSubject = new BehaviorSubject<string[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private auth: AuthService) {}

  startConnection() {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.auth.getToken() || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('NewQuestion', (message: string) => {
      this.addNotification(message);
    });

    this.hubConnection.on('NewAnswer', (message: string) => {
      this.addNotification(message);
    });

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connected');
        return this.hubConnection!.invoke('JoinAdminGroup');
      })
      .then(() => console.log('Joined admin group'))
      .catch(err => console.error('SignalR error:', err));
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  clearNotifications() {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  private addNotification(message: string) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([message, ...current]);
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }
}