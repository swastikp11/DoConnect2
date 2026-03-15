import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { FavouriteService } from '../../services/favourite.service';
import { AuthService } from '../../services/auth.service';
import { Question } from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="header">
      <h2>All Questions</h2>
      <div class="search">
        <input placeholder="Search questions..." [(ngModel)]="searchQuery" (keyup.enter)="search()" />
        <button (click)="search()">Search</button>
        <button class="clear" (click)="clear()">Clear</button>
      </div>
    </div>

    <div *ngIf="questions.length === 0" class="empty">No questions found.</div>

    <div class="question-card" *ngFor="let q of questions">
      <div class="card-top">
        <div class="topic-badge" [routerLink]="['/questions', q.questionId]">{{ q.topic }}</div>
        <button class="fav-btn"
                *ngIf="auth.isLoggedIn() && !auth.isAdmin()"
                (click)="toggleFavourite(q.questionId)"
                [class.active]="isFavourite(q.questionId)"
                [title]="isFavourite(q.questionId) ? 'Remove from favourites' : 'Add to favourites'">
          {{ isFavourite(q.questionId) ? '&#10084;' : '&#9825;' }}
        </button>
      </div>
      <h3 [routerLink]="['/questions', q.questionId]">{{ q.title }}</h3>
      <p [routerLink]="['/questions', q.questionId]">{{ q.body | slice:0:120 }}...</p>
      <div class="meta" [routerLink]="['/questions', q.questionId]">
        <span>by {{ q.authorUsername }}</span>
        <span>{{ q.answerCount }} answers</span>
        <span>{{ q.createdAt | date:'mediumDate' }}</span>
      </div>
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .search { display: flex; gap: 8px; }
    .search input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; width: 240px; }
    button { padding: 8px 16px; background: #7c6af7; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .clear { background: #aaa; }
    .question-card { padding: 20px; margin-bottom: 16px; border: 1px solid #eee; border-radius: 12px; background: #fff; transition: box-shadow 0.2s; }
    .question-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .topic-badge { display: inline-block; padding: 2px 10px; background: #ede9ff; color: #7c6af7; border-radius: 20px; font-size: 12px; cursor: pointer; }
    .fav-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #ccc; padding: 0; transition: color 0.2s, transform 0.2s; }
    .fav-btn:hover { transform: scale(1.2); color: #ec4899; }
    .fav-btn.active { color: #ec4899; }
    h3 { margin: 0 0 8px; cursor: pointer; }
    h3:hover { color: #7c6af7; }
    p { color: #555; margin: 0 0 12px; cursor: pointer; }
    .meta { display: flex; gap: 16px; font-size: 13px; color: #888; cursor: pointer; }
    .empty { text-align: center; color: #aaa; margin-top: 60px; font-size: 18px; }
  `]
})
export class HomeComponent implements OnInit {
  questions: Question[] = [];
  searchQuery = '';

  constructor(
    private questionService: QuestionService,
    private favouriteService: FavouriteService,
    public auth: AuthService
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.questionService.getApproved().subscribe(q => this.questions = q);
  }

  search() {
    this.questionService.getApproved(this.searchQuery).subscribe(q => this.questions = q);
  }

  clear() {
    this.searchQuery = '';
    this.load();
  }

  toggleFavourite(questionId: number) {
    this.favouriteService.toggleFavourite(questionId);
  }

  isFavourite(questionId: number): boolean {
    return this.favouriteService.isFavourite(questionId);
  }
}