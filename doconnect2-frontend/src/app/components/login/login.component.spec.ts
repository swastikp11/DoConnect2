import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '../../app.routes';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when submitting empty form', () => {
    component.login();
    expect(component.submitted).toBeTruthy();
  });

  it('should not login with invalid email', () => {
    component.email = 'invalidemail';
    component.password = 'Test@123';
    expect(component.isValidEmail()).toBeFalsy();
  });

  it('should validate correct email format', () => {
    component.email = 'test@test.com';
    expect(component.isValidEmail()).toBeTruthy();
  });

  it('should have loading false initially', () => {
    expect(component.loading).toBeFalsy();
  });

  it('should have submitted false initially', () => {
    expect(component.submitted).toBeFalsy();
  });

  it('should not submit with empty email and password', () => {
    component.email = '';
    component.password = '';
    component.login();
    expect(component.loading).toBeFalsy();
  });
});