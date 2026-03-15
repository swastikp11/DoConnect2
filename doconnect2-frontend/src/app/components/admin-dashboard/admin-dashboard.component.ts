import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../services/question.service';
import { AnswerService } from '../../services/answer.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Question, Answer } from '../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Admin Dashboard</h2>
        <span class="admin-badge">Admin</span>
      </div>

      <div class="notifications-panel" *ngIf="notifications.length > 0">
        <div class="notif-header">
          <span>Notifications ({{ notifications.length }})</span>
          <button class="clear-btn" (click)="clearNotifications()">Clear all</button>
        </div>
        <div class="notif-item" *ngFor="let n of notifications">
          <span class="notif-dot"></span>
          {{ n }}
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-number">{{ questions.length }}</div>
          <div class="stat-label">Total Questions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number pending">{{ pendingQuestions }}</div>
          <div class="stat-label">Pending Questions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ answers.length }}</div>
          <div class="stat-label">Total Answers</div>
        </div>
        <div class="stat-card">
          <div class="stat-number pending">{{ pendingAnswers }}</div>
          <div class="stat-label">Pending Answers</div>
        </div>
      </div>

      <div class="tabs">
        <button [class.active]="tab === 'questions'" (click)="tab = 'questions'">
          Questions
          <span class="badge" *ngIf="pendingQuestions > 0">{{ pendingQuestions }}</span>
        </button>
        <button [class.active]="tab === 'answers'" (click)="tab = 'answers'; loadAnswers()">
          Answers
          <span class="badge" *ngIf="pendingAnswers > 0">{{ pendingAnswers }}</span>
        </button>
      </div>

      <!-- Questions Tab -->
      <div *ngIf="tab === 'questions'">
        <div *ngIf="questions.length === 0" class="empty">No questions yet.</div>
        <div class="card" *ngFor="let q of questions">
          <div class="card-header">
            <span class="badge-status" [class]="q.status.toLowerCase()">{{ q.status }}</span>
            <span class="topic">{{ q.topic }}</span>
            <span class="date">{{ q.createdAt | date:'mediumDate' }}</span>
          </div>
          <h3>{{ q.title }}</h3>
          <p>{{ q.body | slice:0:150 }}...</p>

          <div *ngIf="q.imagePaths && q.imagePaths.length > 0" class="admin-images">
            <img *ngFor="let img of q.imagePaths"
                 [src]="imageBaseUrl + img"
                 class="admin-img"
                 (click)="openImage(imageBaseUrl + img)"
                 (error)="onImgError($event)" />
          </div>

          <div class="meta">by {{ q.authorUsername }}</div>
          <div class="actions">
            <button class="approve" (click)="approveQuestion(q)" *ngIf="q.status === 'Pending'">
              Approve
            </button>
            <button class="reject" (click)="rejectQuestion(q)" *ngIf="q.status === 'Pending'">
              Reject
            </button>
            <button class="delete" (click)="deleteQuestion(q)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Answers Tab -->
      <div *ngIf="tab === 'answers'">
        <div *ngIf="answers.length === 0" class="empty">No answers yet.</div>
        <div class="card" *ngFor="let a of answers">
          <div class="card-header">
            <span class="badge-status" [class]="a.status.toLowerCase()">{{ a.status }}</span>
            <span class="date">{{ a.createdAt | date:'mediumDate' }}</span>
          </div>
          <p>{{ a.body | slice:0:150 }}...</p>

          <div *ngIf="a.imagePaths && a.imagePaths.length > 0" class="admin-images">
            <img *ngFor="let img of a.imagePaths"
                 [src]="imageBaseUrl + img"
                 class="admin-img"
                 (click)="openImage(imageBaseUrl + img)"
                 (error)="onImgError($event)" />
          </div>

          <div class="meta">by {{ a.authorUsername }}</div>
          <div class="actions">
            <button class="approve" (click)="approveAnswer(a)" *ngIf="a.status === 'Pending'">
              Approve
            </button>
            <button class="reject" (click)="rejectAnswer(a)" *ngIf="a.status === 'Pending'">
              Reject
            </button>
            <button class="delete" (click)="deleteAnswer(a)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 8px 0; }
    .dashboard-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    h2 { margin: 0; font-size: 24px; }
    .admin-badge { background: #ede9ff; color: #7c6af7; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }

    .notifications-panel { background: #fffbeb; border: 1px solid #f6e05e; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-weight: 500; color: #744210; }
    .clear-btn { background: none; border: 1px solid #d69e2e; color: #744210; padding: 2px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .notif-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 14px; color: #744210; border-top: 1px solid #fef08a; }
    .notif-dot { width: 8px; height: 8px; background: #d69e2e; border-radius: 50%; flex-shrink: 0; }

    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-number { font-size: 32px; font-weight: 700; color: #7c6af7; }
    .stat-number.pending { color: #e53e3e; }
    .stat-label { font-size: 13px; color: #888; margin-top: 4px; }

    .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .tabs button { padding: 8px 20px; border: 1.5px solid #7c6af7; background: white; color: #7c6af7; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; }
    .tabs button.active { background: #7c6af7; color: white; }
    .tabs .badge { background: #e53e3e; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; }

    .card { padding: 20px; border: 1px solid #eee; border-radius: 12px; margin-bottom: 16px; background: #fff; }
    .card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .badge-status { padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-status.pending { background: #fff3cd; color: #856404; }
    .badge-status.approved { background: #d1e7dd; color: #0a3622; }
    .badge-status.rejected { background: #f8d7da; color: #842029; }
    .topic { font-size: 13px; color: #7c6af7; background: #ede9ff; padding: 2px 8px; border-radius: 12px; }
    .date { font-size: 12px; color: #aaa; margin-left: auto; }
    h3 { margin: 0 0 8px; font-size: 16px; }
    p { color: #555; margin: 0 0 8px; font-size: 14px; }
    .meta { font-size: 12px; color: #aaa; margin-bottom: 12px; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .approve { background: #198754; color: white; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .reject { background: #ffc107; color: #000; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .delete { background: #dc3545; color: white; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .approve:hover { background: #146c43; }
    .reject:hover { background: #d4a017; }
    .delete:hover { background: #b02a37; }
    .empty { text-align: center; color: #aaa; padding: 40px; font-size: 16px; }
    .admin-images { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
    .admin-img { max-width: 180px; max-height: 140px; border-radius: 8px; object-fit: cover; cursor: pointer; border: 1px solid #eee; transition: opacity 0.2s; }
    .admin-img:hover { opacity: 0.85; }

    @media (max-width: 600px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .date { margin-left: 0; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  answers: Answer[] = [];
  notifications: string[] = [];
  tab = 'questions';
  imageBaseUrl = 'https://localhost:7165';

  get pendingQuestions() { return this.questions.filter(q => q.status === 'Pending').length; }
  get pendingAnswers() { return this.answers.filter(a => a.status === 'Pending').length; }

  constructor(
    private questionService: QuestionService,
    private answerService: AnswerService,
    private notificationService: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadQuestions();
    this.loadAnswers();
    this.notificationService.startConnection();
    this.notificationService.notifications$.subscribe(n => {
      this.notifications = n;
    });
  }

  ngOnDestroy() {
    this.notificationService.stopConnection();
  }

  loadQuestions() {
    this.questionService.getAllForAdmin().subscribe(q => this.questions = q);
  }

  loadAnswers() {
    this.answerService.getAllForAdmin().subscribe(a => this.answers = a);
  }

  clearNotifications() {
    this.notificationService.clearNotifications();
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  onImgError(event: any) {
    event.target.style.display = 'none';
  }

  approveQuestion(q: Question) {
    this.questionService.updateStatus(q.questionId, 'Approve').subscribe(() => this.loadQuestions());
  }

  rejectQuestion(q: Question) {
    this.questionService.updateStatus(q.questionId, 'Reject').subscribe(() => this.loadQuestions());
  }

  deleteQuestion(q: Question) {
    if (confirm('Are you sure you want to delete this question?'))
      this.questionService.delete(q.questionId).subscribe(() => this.loadQuestions());
  }

  approveAnswer(a: Answer) {
    this.answerService.updateStatus(a.answerId, 'Approve').subscribe(() => this.loadAnswers());
  }

  rejectAnswer(a: Answer) {
    this.answerService.updateStatus(a.answerId, 'Reject').subscribe(() => this.loadAnswers());
  }

  deleteAnswer(a: Answer) {
  if (confirm('Are you sure you want to delete this answer?')) {
    this.answerService.delete(a.answerId).subscribe({
      next: () => {
        console.log('Answer deleted successfully');
        this.loadAnswers();
      },
      error: (err) => {
        console.error('Delete error:', err);
        alert('Failed to delete: ' + err.status);
      }
    });
  }
}
}