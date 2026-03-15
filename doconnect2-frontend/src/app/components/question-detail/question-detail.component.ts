import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Question, Answer } from '../../models/models';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="loading" style="text-align:center; margin-top:60px; color:#888;">
      Loading question...
    </div>

    <div *ngIf="!loading && !question" style="text-align:center; margin-top:60px; color:#888;">
      Question not found.
    </div>

    <div *ngIf="!loading && question">
      <div class="question-box">
        <span class="topic-badge">{{ question.topic }}</span>
        <h2>{{ question.title }}</h2>
        <p>{{ question.body }}</p>

        <div *ngIf="question.imagePaths && question.imagePaths.length > 0" class="image-row">
          <img *ngFor="let img of question.imagePaths"
               [src]="imageBaseUrl + img"
               class="question-img"
               (click)="openImage(imageBaseUrl + img)"
               (error)="onImgError($event)" />
        </div>

        <div class="meta">
          by {{ question.authorUsername }} &middot; {{ question.createdAt | date:'mediumDate' }}
        </div>
      </div>

      <h3 style="margin: 24px 0 16px;">{{ answers.length }} Answer(s)</h3>

      <div *ngIf="answers.length === 0" style="color:#888; margin-bottom:24px;">
        No approved answers yet. Be the first to answer!
      </div>

      <div class="answer-card" *ngFor="let a of answers">
        <p>{{ a.body }}</p>

        <div *ngIf="a.imagePaths && a.imagePaths.length > 0" class="image-row">
          <img *ngFor="let img of a.imagePaths"
               [src]="imageBaseUrl + img"
               class="question-img"
               (click)="openImage(imageBaseUrl + img)"
               (error)="onImgError($event)" />
        </div>

        <div class="meta">
          by {{ a.authorUsername }} &middot; {{ a.createdAt | date:'mediumDate' }}
        </div>
      </div>

      <div class="answer-form" *ngIf="auth.isLoggedIn()">
        <h3>Your Answer</h3>
        <textarea
          [(ngModel)]="answerBody"
          rows="4"
          placeholder="Write your answer here...">
        </textarea>
        <input type="file" multiple accept="image/*" (change)="onFileChange($event)" />
        <div class="error" *ngIf="error">{{ error }}</div>
        <div class="success" *ngIf="success">
          Answer submitted! Waiting for admin approval.
        </div>
        <button (click)="submitAnswer()">Submit Answer</button>
      </div>

      <div *ngIf="!auth.isLoggedIn()" class="login-prompt">
        Please <a href="/login">login</a> to post an answer.
      </div>
    </div>
  `,
  styles: [`
    .question-box {
      padding: 24px;
      border: 1px solid #eee;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .topic-badge {
      display: inline-block;
      padding: 2px 10px;
      background: #ede9ff;
      color: #7c6af7;
      border-radius: 20px;
      font-size: 12px;
      margin-bottom: 8px;
    }
    h2 { margin: 8px 0; }
    .meta { font-size: 13px; color: #888; margin-top: 12px; }
    .image-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .question-img {
      max-width: 220px;
      max-height: 180px;
      border-radius: 8px;
      object-fit: cover;
      cursor: pointer;
      border: 1px solid #eee;
      transition: opacity 0.2s;
    }
    .question-img:hover { opacity: 0.85; }
    .answer-card {
      padding: 16px;
      border-left: 3px solid #7c6af7;
      margin-bottom: 16px;
      background: #fafafa;
      border-radius: 8px;
    }
    .answer-form { margin-top: 32px; }
    textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 15px;
      margin-bottom: 12px;
      resize: vertical;
    }
    input[type=file] { margin-bottom: 12px; display: block; }
    button {
      padding: 10px 24px;
      background: #7c6af7;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 15px;
      margin-top: 8px;
    }
    button:hover { background: #6355e0; }
    .error { color: red; margin-bottom: 8px; }
    .success { color: green; margin-bottom: 8px; }
    .login-prompt { color: #888; margin-top: 24px; }
    .login-prompt a { color: #7c6af7; }
  `]
})
export class QuestionDetailComponent implements OnInit {
  question: Question | null = null;
  answers: Answer[] = [];
  answerBody = '';
  files: File[] = [];
  error = '';
  success = false;
  loading = true;
  private baseUrl = 'https://localhost:7165/api';
  imageBaseUrl = 'https://localhost:7165';

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading question id:', id);

    this.http.get<Question>(`${this.baseUrl}/questions/${id}`).subscribe({
      next: (q) => {
        console.log('Question loaded:', q);
        this.question = q;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading question:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.http.get<Answer[]>(`${this.baseUrl}/questions/${id}/answers`).subscribe({
      next: (a) => {
        console.log('Answers loaded:', a);
        this.answers = a;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading answers:', err)
    });
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  onImgError(event: any) {
    event.target.style.display = 'none';
  }

  onFileChange(event: any) {
    this.files = Array.from(event.target.files);
  }

  submitAnswer() {
    if (!this.answerBody.trim()) {
      this.error = 'Answer cannot be empty.';
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.error = 'Please login to post an answer.';
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    const formData = new FormData();
    formData.append('body', this.answerBody);
    this.files.forEach(f => formData.append('images', f));

    const token = this.auth.getToken();
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    this.http.post(`${this.baseUrl}/questions/${id}/answers`, formData, { headers }).subscribe({
      next: () => {
        this.success = true;
        this.error = '';
        this.answerBody = '';
        this.files = [];
        this.cdr.detectChanges();
        this.http.get<Answer[]>(`${this.baseUrl}/questions/${id}/answers`).subscribe(a => {
          this.answers = a;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Answer submit error:', err);
        this.error = 'Failed to submit answer. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}