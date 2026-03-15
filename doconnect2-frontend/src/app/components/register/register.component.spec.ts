import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '../../app.routes';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty fields initially', () => {
    expect(component.username).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  it('should validate email correctly', () => {
    component.email = 'test@test.com';
    expect(component.isValidEmail()).toBeTruthy();

    component.email = 'invalid';
    expect(component.isValidEmail()).toBeFalsy();
  });

  it('should not submit with empty fields', () => {
    component.register();
    expect(component.submitted).toBeTruthy();
    expect(component.loading).toBeFalsy();
  });

  it('should not submit when passwords do not match', () => {
    component.username = 'testuser';
    component.email = 'test@test.com';
    component.password = 'Test@123';
    component.confirmPassword = 'Different@123';
    component.register();
    expect(component.loading).toBeFalsy();
  });

  it('should not submit with password less than 6 characters', () => {
    component.username = 'testuser';
    component.email = 'test@test.com';
    component.password = '123';
    component.confirmPassword = '123';
    component.register();
    expect(component.loading).toBeFalsy();
  });
});