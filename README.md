# DoConnect

DoConnect is a full-stack Q&A platform where users can ask and answer questions on various technical topics. It supports role-based access for regular users and administrators, with a content moderation workflow, real-time notifications, and image upload support.

---

## Author

**Swastik Padhy**
GitHub: [@swastikp11](https://github.com/swastikp11)

---

## Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication & Security](#authentication--security)
- [Real-Time Notifications](#real-time-notifications)
- [Testing](#testing)
- [Content Approval Workflow](#content-approval-workflow)

---

## About the Project

DoConnect is built to give people a space to ask technical questions and get answers from the community. Every question and answer goes through an admin approval process before being visible publicly, ensuring the quality of content on the platform.

There are two types of users:

- **User** — Registers, logs in, asks questions, posts answers, searches questions, uploads images.
- **Admin** — Logs in, views all content, approves or rejects questions and answers, deletes inappropriate content, and receives real-time notifications when new content is posted.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18 |
| Backend | ASP.NET Core 8 Web API |
| Database | SQL Server |
| ORM | Entity Framework Core 8 |
| Authentication | JWT Bearer Tokens |
| Real-Time | SignalR |
| API Documentation | Swagger / Swashbuckle |
| File Storage | Server-side (wwwroot/uploads) |
| Testing | Jasmine + Karma |
| Version Control | Git / GitHub |

---

## Features

### User
- Register and login with email and password
- Ask questions with title, body, topic, and optional image attachments
- Browse all approved questions on the home page
- Search questions by keyword across title, body, and topic
- View question details and all approved answers
- Post multiple answers to any question with optional images
- Client-side form validation on all forms
- Session persistence using JWT stored in localStorage

### Admin
- Secure admin login with role-based access
- View all questions and answers regardless of approval status
- Approve or reject pending questions and answers
- Delete any inappropriate content
- Dashboard with stats showing total and pending counts
- Real-time notifications via SignalR when new questions or answers are posted
- Notification badge on navbar showing unread count
- Notification panel on dashboard with clear all option

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Angular Frontend                    │
│  Components → Services → HTTP Interceptor → Guards  │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP / JWT
                      ▼
┌─────────────────────────────────────────────────────┐
│              ASP.NET Core Web API                    │
│  Controllers → Services → EF Core → SQL Server      │
│  JWT Middleware │ SignalR Hub │ Static Files         │
└─────────────────────────────────────────────────────┘
```

### Frontend (Angular)
- **Components** — Standalone components for each page: Home, Login, Register, Ask Question, Question Detail, Admin Dashboard, Navbar
- **Services** — `AuthService`, `QuestionService`, `AnswerService`, `NotificationService`
- **Guards** — `authGuard` requires login, `adminGuard` requires Admin role
- **Interceptor** — `authInterceptor` automatically attaches JWT token to every HTTP request
- **Models** — TypeScript interfaces for `User`, `Question`, `Answer`
- **Routing** — Angular Router with guard protection on private routes

### Backend (ASP.NET Core)
- **Controllers** — `AuthController`, `QuestionsController`, `AnswersController`
- **Services** — `AuthService`, `QuestionService`, `AnswerService` with interface-based dependency injection
- **Data** — `AppDbContext` using Entity Framework Core
- **Hubs** — `NotificationHub` for SignalR
- **DTOs** — Separate request and response data transfer objects

---

## Database Schema

### Users
| Column | Type | Constraints |
|--------|------|-------------|
| UserId | INT | PK, IDENTITY |
| Username | NVARCHAR(100) | NOT NULL |
| Email | NVARCHAR(200) | NOT NULL, UNIQUE |
| PasswordHash | NVARCHAR(MAX) | NOT NULL |
| Role | NVARCHAR(50) | NOT NULL, DEFAULT 'User' |
| CreatedAt | DATETIME2 | NOT NULL |

### Questions
| Column | Type | Constraints |
|--------|------|-------------|
| QuestionId | INT | PK, IDENTITY |
| Title | NVARCHAR(300) | NOT NULL |
| Body | NVARCHAR(MAX) | NOT NULL |
| Topic | NVARCHAR(100) | NOT NULL |
| Status | NVARCHAR(50) | DEFAULT 'Pending' |
| CreatedAt | DATETIME2 | NOT NULL |
| UserId | INT | FK → Users |

### Answers
| Column | Type | Constraints |
|--------|------|-------------|
| AnswerId | INT | PK, IDENTITY |
| Body | NVARCHAR(MAX) | NOT NULL |
| Status | NVARCHAR(50) | DEFAULT 'Pending' |
| CreatedAt | DATETIME2 | NOT NULL |
| QuestionId | INT | FK → Questions |
| UserId | INT | FK → Users |

### Images
| Column | Type | Constraints |
|--------|------|-------------|
| ImageId | INT | PK, IDENTITY |
| ImagePath | NVARCHAR(MAX) | NOT NULL |
| FileName | NVARCHAR(MAX) | NOT NULL |
| UploadedAt | DATETIME2 | NOT NULL |
| QuestionId | INT | FK → Questions, NULL |
| AnswerId | INT | FK → Answers, NULL |

### Relationships
- **Users → Questions** — One-to-Many
- **Users → Answers** — One-to-Many
- **Questions → Answers** — One-to-Many
- **Questions → Images** — One-to-Many
- **Answers → Images** — One-to-Many

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | None | Register new user |
| POST | /api/auth/login | None | Login, returns JWT token |

### Questions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/questions | None | Get approved questions (supports ?search=) |
| GET | /api/questions/{id} | None | Get single question |
| POST | /api/questions | User | Post a question with optional images |
| GET | /api/questions/admin/all | Admin | Get all questions any status |
| PATCH | /api/questions/{id}/status | Admin | Approve or reject |
| DELETE | /api/questions/{id} | Admin | Delete a question |

### Answers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/questions/{id}/answers | None | Get approved answers |
| POST | /api/questions/{id}/answers | User | Post an answer with optional images |
| GET | /api/answers/admin/all | Admin | Get all answers any status |
| PATCH | /api/answers/{id}/status | Admin | Approve or reject |
| DELETE | /api/answers/{id} | Admin | Delete an answer |

### SignalR
| Endpoint | Description |
|----------|-------------|
| /hubs/notifications | WebSocket hub for admin real-time notifications |

---

## Project Structure

### Backend (DoConnect2)
```
DoConnect2/
├── Controllers/
│   ├── AuthController.cs
│   ├── QuestionsController.cs
│   └── AnswersController.cs
├── Data/
│   └── AppDbContext.cs
├── DTOs/
│   └── Dtos.cs
├── Hubs/
│   └── NotificationHub.cs
├── Models/
│   ├── User.cs
│   ├── Question.cs
│   ├── Answer.cs
│   └── Image.cs
├── Services/
│   ├── Interfaces/
│   │   ├── IAuthService.cs
│   │   ├── IQuestionService.cs
│   │   └── IAnswerService.cs
│   ├── AuthService.cs
│   ├── QuestionService.cs
│   └── AnswerService.cs
├── wwwroot/uploads/
├── appsettings.json
└── Program.cs
```

### Frontend (doconnect2-frontend)
```
doconnect2-frontend/
├── src/app/
│   ├── components/
│   │   ├── admin-dashboard/
│   │   ├── ask-question/
│   │   ├── home/
│   │   ├── login/
│   │   ├── navbar/
│   │   ├── question-detail/
│   │   └── register/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── admin.guard.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   ├── models/
│   │   └── models.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── question.service.ts
│   │   ├── answer.service.ts
│   │   └── notification.service.ts
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
└── src/environments/
    └── environment.ts
```

---

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- Angular CLI — `npm install -g @angular/cli`
- SQL Server

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/swastikp11/DoConnect.git
cd DoConnect/DoConnect2
```

2. Update the connection string in `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=BT-21052885\\SQLEXPRESS;Database=DoConnectDbase;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

3. Run migrations:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

4. Run the backend:
```bash
dotnet run
```

Backend runs at `https://localhost:7165`.
Swagger UI available at `https://localhost:7165/swagger`.

### Frontend Setup

1. Navigate to the frontend:
```bash
cd doconnect2-frontend
npm install
ng serve
```

Frontend runs at `http://localhost:4200`.

### Default Admin Account
| Field | Value |
|-------|-------|
| Email | admin@doconnect.com |
| Password | Admin@123 |

---

## Authentication & Security

DoConnect uses JWT Bearer Token authentication.

1. User logs in via `POST /api/auth/login`
2. Server validates credentials and returns a signed JWT token
3. Token contains claims: `UserId`, `Username`, `Email`, `Role`
4. Angular stores the token in `localStorage`
5. `authInterceptor` automatically attaches `Authorization: Bearer <token>` to every HTTP request
6. Backend `[Authorize]` and `[Authorize(Roles = "Admin")]` attributes validate the token
7. `authGuard` prevents unauthenticated users from accessing protected routes
8. `adminGuard` prevents non-admin users from accessing the admin dashboard

---

## Real-Time Notifications

DoConnect uses SignalR for real-time admin notifications.

- When a user posts a question, the backend fires a `NewQuestion` event to all connected admins
- When a user posts an answer, the backend fires a `NewAnswer` event to all connected admins
- Admin clients connect to `/hubs/notifications` and join the `Admins` SignalR group
- The admin navbar shows a red unread count badge
- The admin dashboard shows a notification panel with all incoming alerts
- Notifications can be cleared using the Clear All button

---

## Testing

40 unit tests written using Jasmine and Karma.

### Run Tests
```bash
cd doconnect2-frontend
ng test --no-watch --browsers=ChromeHeadless
```

### Test Coverage

| File | Tests | What is tested |
|------|-------|----------------|
| auth.service.spec.ts | 9 | Login, register, token, role, logout |
| question.service.spec.ts | 7 | Get, create, update status, delete, search |
| answer.service.spec.ts | 6 | Get, create, update status, delete |
| login.component.spec.ts | 7 | Validation, form state, email format |
| register.component.spec.ts | 6 | Validation, password match, min length |
| app.spec.ts | 1 | App initialisation |

**Result: 40 passed, 0 failed**

---

## Content Approval Workflow

```
User posts question or answer
            ↓
      Status = Pending
   (not visible to public)
            ↓
    Admin reviews content
            ↓
   Approve          Reject
      ↓                ↓
Status = Approved   Status = Rejected
(visible to public) (not visible)
```

---

## Environment Configuration

### Backend — `appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=BT-21052885\\SQLEXPRESS;Database=DoConnectDbase;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "DoConnect_SuperSecret_JWT_Key_2024_MustBe32CharsMin!",
    "Issuer": "DoConnectAPI",
    "Audience": "DoConnectClient"
  }
}
```

### Frontend — `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7165/api',
  hubUrl: 'https://localhost:7165/hubs/notifications'
};
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
