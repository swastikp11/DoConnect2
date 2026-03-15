import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Question } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FavouriteService {
  private storageKey = 'doconnect_favourites';
  private favouritesSubject = new BehaviorSubject<number[]>(this.loadFromStorage());
  favourites$ = this.favouritesSubject.asObservable();

  private loadFromStorage(): number[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveToStorage(ids: number[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(ids));
  }

  isFavourite(questionId: number): boolean {
    return this.favouritesSubject.value.includes(questionId);
  }

  toggleFavourite(questionId: number) {
    const current = this.favouritesSubject.value;
    const updated = current.includes(questionId)
      ? current.filter(id => id !== questionId)
      : [...current, questionId];

    this.saveToStorage(updated);
    this.favouritesSubject.next(updated);
  }

  getFavouriteIds(): number[] {
    return this.favouritesSubject.value;
  }

  clearAll() {
    this.saveToStorage([]);
    this.favouritesSubject.next([]);
  }
}