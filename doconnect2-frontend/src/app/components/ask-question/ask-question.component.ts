import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-ask-question',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="form-box">
      <h2>Ask a Question</h2>
      <p class="subtitle">Share your question with the community</p>

      <div class="field">
        <label>Title <span class="required">*</span></label>
        <input type="text" placeholder="Write a clear, specific title"
          [(ngModel)]="title" [class.invalid]="submitted && !title.trim()" />
        <span class="err" *ngIf="submitted && !title.trim()">Title is required</span>
        <span class="hint">{{ title.length }}/300 characters</span>
      </div>

      <div class="field">
        <label>Body <span class="required">*</span></label>
        <textarea placeholder="Describe your question in detail..."
          [(ngModel)]="body" rows="6"
          [class.invalid]="submitted && !body.trim()"></textarea>
        <span class="err" *ngIf="submitted && !body.trim()">Body is required</span>
      </div>

      <div class="field">
        <label>Topic <span class="required">*</span></label>
        <input type="text" placeholder="e.g. Angular, Security, Database"
          [(ngModel)]="topic" [class.invalid]="submitted && !topic.trim()" />
        <span class="err" *ngIf="submitted && !topic.trim()">Topic is required</span>
      </div>

      <div class="field">
        <label>Attach Images <span class="optional">(optional)</span></label>
        <input type="file" multiple accept="image/*" (change)="onFileChange($event)" />
        <span class="hint" *ngIf="files.length > 0">{{ files.length }} file(s) selected</span>
      </div>

      <div class="error" *ngIf="error">{{ error }}</div>
      <div class="success" *ngIf="success">
        Question submitted successfully! Waiting for admin approval.
        Redirecting to home...
      </div>

      <div class="actions">
        <button class="cancel" (click)="router.navigate(['/'])">Cancel</button>
        <button (click)="submit()" [disabled]="loading">
          {{ loading ? 'Submitting...' : 'Submit Question' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .form-box {
      max-width: 680px;
      margin: 40px auto;
      padding: 36px;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      background: #fff;
    }
    h2 { margin: 0 0 6px; font-size: 24px; }
    .subtitle { color: #888; margin: 0 0 28px; font-size: 14px; }
    .field { margin-bottom: 20px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #444; }
    .required { color: #e53e3e; }
    .optional { color: #aaa; font-weight: 400; }
    input[type=text], textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 15px;
      transition: border 0.2s;
      font-family: inherit;
    }
    input:focus, textarea:focus { outline: none; border-color: #7c6af7; }
    input.invalid, textarea.invalid { border-color: #e53e3e; }
    textarea { resize: vertical; min-height: 120px; }
    .err { color: #e53e3e; font-size: 12px; margin-top: 4px; display: block; }
    .hint { color: #aaa; font-size: 12px; margin-top: 4px; display: block; }
    .error {
      background: #fff5f5;
      color: #e53e3e;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 14px;
      font-size: 14px;
    }
    .success {
      background: #f0fff4;
      color: #276749;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 14px;
      font-size: 14px;
    }
    .actions { display: flex; gap: 12px; justify-content: flex-end; }
    button {
      padding: 10px 28px;
      background: #7c6af7;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover:not(:disabled) { background: #6355e0; }
    button:disabled { background: #b0a8f5; cursor: not-allowed; }
    .cancel {
      background: #f1f1f1;
      color: #444;
    }
    .cancel:hover { background: #e0e0e0; }
    @media (max-width: 720px) {
      .form-box { margin: 20px 16px; padding: 24px; }
      .actions { flex-direction: column; }
      button { width: 100%; }
    }
  `]
})
export class AskQuestionComponent {
  title = '';
  body = '';
  topic = '';
  files: File[] = [];
  error = '';
  success = false;
  loading = false;
  submitted = false;

  constructor(public router: Router, private questionService: QuestionService) {}

  onFileChange(event: any) {
    this.files = Array.from(event.target.files);
  }

  submit() {
    this.submitted = true;
    this.error = '';

    if (!this.title.trim() || !this.body.trim() || !this.topic.trim()) {
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('body', this.body);
    formData.append('topic', this.topic);
    this.files.forEach(f => formData.append('images', f));

    this.questionService.create(formData).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: () => {
        this.error = 'Failed to submit question. Please try again.';
        this.loading = false;
      }
    });
  }
}