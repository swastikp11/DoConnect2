import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Answer } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AnswerService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getByQuestion(questionId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/questions/${questionId}/answers`);
  }

  create(questionId: number, formData: FormData): Observable<Answer> {
    return this.http.post<Answer>(`${this.apiUrl}/questions/${questionId}/answers`, formData);
  }

  getAllForAdmin(): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/answers/admin/all`);
  }

  updateStatus(id: number, action: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/answers/${id}/status`, { action });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/answers/${id}`);
  }
}