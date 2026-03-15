import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Question } from '../models/models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getApproved(search?: string): Observable<Question[]> {
    const url = search
      ? `${this.apiUrl}/questions?search=${search}`
      : `${this.apiUrl}/questions`;
    return this.http.get<Question[]>(url);
  }

  getById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/questions/${id}`);
  }

  create(formData: FormData): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/questions`, formData);
  }

  getAllForAdmin(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/questions/admin/all`);
  }

  updateStatus(id: number, action: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/questions/${id}/status`, { action });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/questions/${id}`);
  }
}