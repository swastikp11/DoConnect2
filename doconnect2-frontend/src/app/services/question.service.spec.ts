import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
  let service: QuestionService;
  let httpMock: HttpTestingController;

  const mockQuestions = [
    {
      questionId: 1,
      title: 'Test Question',
      body: 'Test body',
      topic: 'Testing',
      status: 'Approved',
      createdAt: '2024-01-01',
      authorUsername: 'testuser',
      answerCount: 0,
      imagePaths: []
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuestionService]
    });
    service = TestBed.inject(QuestionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get approved questions', () => {
    service.getApproved().subscribe(questions => {
      expect(questions.length).toBe(1);
      expect(questions[0].title).toBe('Test Question');
    });

    const req = httpMock.expectOne('https://localhost:7165/api/questions');
    expect(req.request.method).toBe('GET');
    req.flush(mockQuestions);
  });

  it('should get approved questions with search query', () => {
    service.getApproved('angular').subscribe(questions => {
      expect(questions).toBeTruthy();
    });

    const req = httpMock.expectOne('https://localhost:7165/api/questions?search=angular');
    expect(req.request.method).toBe('GET');
    req.flush(mockQuestions);
  });

  it('should get question by id', () => {
    service.getById(1).subscribe(question => {
      expect(question.questionId).toBe(1);
      expect(question.title).toBe('Test Question');
    });

    const req = httpMock.expectOne('https://localhost:7165/api/questions/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockQuestions[0]);
  });

  it('should get all questions for admin', () => {
    service.getAllForAdmin().subscribe(questions => {
      expect(questions.length).toBe(1);
    });

    const req = httpMock.expectOne('https://localhost:7165/api/questions/admin/all');
    expect(req.request.method).toBe('GET');
    req.flush(mockQuestions);
  });

  it('should update question status', () => {
    service.updateStatus(1, 'Approve').subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('https://localhost:7165/api/questions/1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ action: 'Approve' });
    req.flush({});
  });

  it('should delete a question', () => {
    service.delete(1).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('https://localhost:7165/api/questions/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should create a question', () => {
    const formData = new FormData();
    formData.append('title', 'New Question');
    formData.append('body', 'Body text');
    formData.append('topic', 'Angular');

    service.create(formData).subscribe(question => {
      expect(question.title).toBe('Test Question');
    });

    const req = httpMock.expectOne('https://localhost:7165/api/questions');
    expect(req.request.method).toBe('POST');
    req.flush(mockQuestions[0]);
  });
});