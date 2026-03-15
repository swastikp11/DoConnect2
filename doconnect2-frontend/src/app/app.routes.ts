import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AskQuestionComponent } from './components/ask-question/ask-question.component';
import { QuestionDetailComponent } from './components/question-detail/question-detail.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { FavouritesComponent } from './components/favourites/favourites.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'ask', component: AskQuestionComponent, canActivate: [authGuard] },
  { path: 'questions/:id', component: QuestionDetailComponent },
  { path: 'favourites', component: FavouritesComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];