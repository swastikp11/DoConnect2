import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavouriteService } from '../../services/favourite.service';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/models';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fav-page">
      <div class="fav-header">
        <h2>My Favourites</h2>
        <button class="clear-btn" *ngIf="favourites.length > 0" (click)="clearAll()">
          Clear all
        </button>
      </div>

      <div *ngIf="loading" class="empty">Loading favourites...</div>

      <div *ngIf="!loading && favourites.length === 0" class="empty">
        <div class="empty-icon">&#9825;</div>
        <p>No favourite questions yet.</p>
        <p style="font-size:14px; margin-top:8px;">
          Click the heart icon on any question to save it here.
        </p>
        <a routerLink="/" class="browse-btn">Browse Questions</a>
      </div>

      <div class="question-card"
           *ngFor="let q of favourites"
           [routerLink]="['/questions', q.questionId]">
        <div class="card-top">
          <span class="topic-badge">{{ q.topic }}</span>
          <button class="unfav-btn" (click)="removeFavourite($event, q.questionId)">
            &#10084; Remove
          </button>
        </div>
        <h3>{{ q.title }}</h3>
        <p>{{ q.body | slice:0:120 }}...</p>
        <div class="meta">
          by {{ q.authorUsername }} &middot;
          {{ q.answerCount }} answers &middot;
          {{ q.createdAt | date:'mediumDate' }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fav-page { padding: 8px 0; }
    .fav-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h2 { margin: 0; font-size: 24px; }
    .clear-btn { background: #fee2e2; color: #dc2626; border: none; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; }
    .clear-btn:hover { background: #fecaca; }
    .empty { text-align: center; color: #aaa; padding: 60px 20px; }
    .empty-icon { font-size: 48px; color: #e0e0e0; margin-bottom: 16px; }
    .empty p { font-size: 16px; }
    .browse-btn { display: inline-block; margin-top: 20px; background: #7c6af7; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .browse-btn:hover { background: #6355e0; text-decoration: none; }
    .question-card { padding: 20px; margin-bottom: 16px; border: 1px solid #eee; border-radius: 12px; cursor: pointer; background: #fff; transition: box-shadow 0.2s; }
    .question-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .topic-badge { display: inline-block; padding: 2px 10px; background: #ede9ff; color: #7c6af7; border-radius: 20px; font-size: 12px; }
    .unfav-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .unfav-btn:hover { background: #fecaca; }
    h3 { margin: 0 0 8px; font-size: 16px; color: #1a1a2e; }
    p { color: #555; margin: 0 0 10px; font-size: 14px; }
    .meta { font-size: 12px; color: #aaa; }
  `]
})
export class FavouritesComponent implements OnInit {
  favourites: Question[] = [];
  loading = true;

  constructor(
    private favouriteService: FavouriteService,
    private questionService: QuestionService
  ) {}

  ngOnInit() {
    this.loadFavourites();
    this.favouriteService.favourites$.subscribe(() => {
      this.loadFavourites();
    });
  }

  loadFavourites() {
    const ids = this.favouriteService.getFavouriteIds();
    if (ids.length === 0) {
      this.favourites = [];
      this.loading = false;
      return;
    }

    this.questionService.getApproved().subscribe(questions => {
      this.favourites = questions.filter(q => ids.includes(q.questionId));
      this.loading = false;
    });
  }

  removeFavourite(event: Event, questionId: number) {
    event.stopPropagation();
    this.favouriteService.toggleFavourite(questionId);
  }

  clearAll() {
    if (confirm('Remove all favourites?')) {
      this.favouriteService.clearAll();
      this.favourites = [];
    }
  }
}