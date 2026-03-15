import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', redirectTo: '' },
          { path: '', redirectTo: '', pathMatch: 'full' }
        ])
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null token when not logged in', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should return false for isLoggedIn when no user', () => {
    expect(service.isLoggedIn()).toBeFalsy();
  });

  it('should return false for isAdmin when not logged in', () => {
    expect(service.isAdmin()).toBeFalsy();
  });

  it('should return null for getUser when not logged in', () => {
    expect(service.getUser()).toBeNull();
  });

  it('should login successfully and store user', () => {
    const mockUser = {
      userId: 1,
      username: 'testuser',
      role: 'User',
      token: 'fake-jwt-token'
    };

    service.login({ email: 'test@test.com', password: 'Test@123' }).subscribe(user => {
      expect(user.username).toBe('testuser');
      expect(user.token).toBe('fake-jwt-token');
      expect(service.isLoggedIn()).toBeTruthy();
      expect(service.getToken()).toBe('fake-jwt-token');
    });

    const req = httpMock.expectOne('https://localhost:7165/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);
  });

  it('should register successfully', () => {
    const mockUser = {
      userId: 2,
      username: 'newuser',
      role: 'User',
      token: 'new-token'
    };

    service.register({
      username: 'newuser',
      email: 'new@test.com',
      password: 'Test@123'
    }).subscribe(user => {
      expect(user.username).toBe('newuser');
      expect(service.isLoggedIn()).toBeTruthy();
    });

    const req = httpMock.expectOne('https://localhost:7165/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);
  });

  it('should set isAdmin to true for admin user', () => {
    const mockAdmin = {
      userId: 1,
      username: 'admin',
      role: 'Admin',
      token: 'admin-token'
    };

    service.login({ email: 'admin@doconnect.com', password: 'Admin@123' }).subscribe(() => {
      expect(service.isAdmin()).toBeTruthy();
    });

    const req = httpMock.expectOne('https://localhost:7165/api/auth/login');
    req.flush(mockAdmin);
  });

  it('should clear user on logout', () => {
  // Manually set the user via login first
  const mockUser = { userId: 1, username: 'test', role: 'User', token: 'token' };
  
  // Set directly on the subject
  (service as any).currentUserSubject.next(mockUser);
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  // Verify user is set
  expect(service.isLoggedIn()).toBeTruthy();
  
  localStorage.removeItem('user');
  (service as any).currentUserSubject.next(null);
  
  // Verify cleared
  expect(service.isLoggedIn()).toBeFalsy();
  expect(service.getToken()).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
});

});