# DoConnect — Use Case Document

## Project: DoConnect Q&A Platform
## Author: Swastik Padhy

---

## Overview

This document describes the use cases for the DoConnect Q&A platform. The system has two types of actors:

- **User** — A registered member of the platform who can ask questions, answer questions, search, and manage favourites.
- **Admin** — A privileged user who moderates content by approving, rejecting, or deleting questions and answers, and receives real-time notifications.

---

## Actors

| Actor | Description |
|-------|-------------|
| User | Registered member of the platform |
| Admin | Privileged user with moderation rights |
| Guest | Unregistered visitor (can only view approved content) |
| System | The DoConnect application itself |

---

## Use Case List

| ID | Use Case | Actor |
|----|----------|-------|
| UC-01 | User Registration | Guest |
| UC-02 | User Login | User, Admin |
| UC-03 | User Logout | User, Admin |
| UC-04 | Ask a Question | User |
| UC-05 | Search Questions | User, Guest |
| UC-06 | View Question Detail | User, Guest |
| UC-07 | Answer a Question | User |
| UC-08 | Upload Image | User |
| UC-09 | Add Question to Favourites | User |
| UC-10 | View Favourites | User |
| UC-11 | Admin Login | Admin |
| UC-12 | View All Questions (Admin) | Admin |
| UC-13 | Approve or Reject Question | Admin |
| UC-14 | Approve or Reject Answer | Admin |
| UC-15 | Delete Question | Admin |
| UC-16 | Delete Answer | Admin |
| UC-17 | Receive Real-Time Notifications | Admin |

---

## Detailed Use Cases

---

### UC-01 — User Registration

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-01 |
| **Use Case Name** | User Registration |
| **Actor** | Guest |
| **Description** | A new visitor creates an account on DoConnect |
| **Precondition** | User is not already registered. User is on the Register page. |
| **Postcondition** | A new user account is created. User is logged in and redirected to the home page. |

**Main Flow:**
1. Guest navigates to `/register`
2. Guest enters Username, Email, Password, and Confirm Password
3. System validates all fields — username required, valid email format, password minimum 6 characters, passwords match
4. Guest clicks Register
5. System sends `POST /api/auth/register` to the backend
6. Backend checks email is not already in use
7. Backend saves the new user with Role = User
8. Backend generates a JWT token and returns it
9. Angular stores the token in localStorage
10. User is redirected to the home page

**Alternate Flow — Email Already Exists:**
- At step 6, if email is already registered, backend returns 409 Conflict
- System displays "Registration failed. Email may already be in use."
- User must enter a different email

**Alternate Flow — Validation Fails:**
- At step 3, if any field is invalid, red error messages appear under each field
- Form is not submitted until all fields are valid

---

### UC-02 — User Login

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-02 |
| **Use Case Name** | User Login |
| **Actor** | User, Admin |
| **Description** | A registered user logs into the platform |
| **Precondition** | User has a registered account. User is on the Login page. |
| **Postcondition** | User is authenticated. JWT token stored in localStorage. User redirected based on role. |

**Main Flow:**
1. User navigates to `/login`
2. User enters Email and Password
3. System validates fields — email format, password required
4. User clicks Login
5. System sends `POST /api/auth/login` to the backend
6. Backend verifies email exists and password matches
7. Backend generates JWT token containing UserId, Username, Email, Role
8. Angular stores token in localStorage
9. If Role = Admin → redirect to `/admin`
10. If Role = User → redirect to `/` (home page)

**Alternate Flow — Invalid Credentials:**
- At step 6, if credentials are wrong, backend returns 401 Unauthorized
- System displays "Invalid email or password."
- User must try again

---

### UC-03 — User Logout

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-03 |
| **Use Case Name** | User Logout |
| **Actor** | User, Admin |
| **Description** | A logged-in user logs out of the platform |
| **Precondition** | User is logged in |
| **Postcondition** | JWT token removed from localStorage. User redirected to login page. |

**Main Flow:**
1. User clicks the Logout button in the navbar
2. Angular calls `AuthService.logout()`
3. System removes user data from localStorage
4. SignalR connection is stopped (if admin)
5. Notifications are cleared (if admin)
6. User is redirected to `/login`

---

### UC-04 — Ask a Question

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-04 |
| **Use Case Name** | Ask a Question |
| **Actor** | User |
| **Description** | A logged-in user submits a new question to the platform |
| **Precondition** | User is logged in. User is on the Ask Question page. |
| **Postcondition** | Question is saved with Status = Pending. Admin receives real-time notification. |

**Main Flow:**
1. User clicks Ask Question in the navbar
2. System checks `authGuard` — confirms user is logged in
3. User is directed to `/ask`
4. User fills in Title, Body, and Topic fields
5. User optionally attaches one or more images
6. User clicks Submit Question
7. System validates all fields are filled
8. Angular creates a `FormData` object with the question data and images
9. `authInterceptor` attaches JWT token to the request
10. System sends `POST /api/questions` to the backend
11. Backend saves question with Status = Pending
12. Backend saves uploaded images to `wwwroot/uploads/`
13. Backend fires SignalR `NewQuestion` event to all connected admins
14. System displays success message — "Question submitted! Waiting for admin approval."
15. User is redirected to home page after 2 seconds

**Alternate Flow — Validation Fails:**
- At step 7, if any required field is empty, error messages appear
- Form is not submitted

**Alternate Flow — Not Logged In:**
- At step 2, `authGuard` redirects user to `/login`

---

### UC-05 — Search Questions

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-05 |
| **Use Case Name** | Search Questions |
| **Actor** | User, Guest |
| **Description** | A visitor searches for questions using a keyword |
| **Precondition** | User is on the home page |
| **Postcondition** | Filtered list of approved questions matching the keyword is displayed |

**Main Flow:**
1. User types a keyword in the search input on the home page
2. User presses Enter or clicks Search
3. System sends `GET /api/questions?search=keyword` to the backend
4. Backend searches Title, Body, and Topic fields of all Approved questions
5. Matching questions are returned and displayed
6. If no results, "No questions found" message is shown

**Alternate Flow — Clear Search:**
- User clicks the Clear button
- Search query is reset
- All approved questions are loaded again

---

### UC-06 — View Question Detail

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-06 |
| **Use Case Name** | View Question Detail |
| **Actor** | User, Guest |
| **Description** | A visitor views the full details of a question and its approved answers |
| **Precondition** | Question exists and has Status = Approved |
| **Postcondition** | Question details, images, and approved answers are displayed |

**Main Flow:**
1. User clicks on a question card on the home page
2. Angular navigates to `/questions/{id}`
3. System sends `GET /api/questions/{id}` to the backend
4. System sends `GET /api/questions/{id}/answers` to the backend
5. Question title, body, topic, author, date, and images are displayed
6. Approved answers with author and date are displayed below
7. If user is logged in, the answer form is shown at the bottom
8. If user is not logged in, "Please login to post an answer" message is shown

---

### UC-07 — Answer a Question

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-07 |
| **Use Case Name** | Answer a Question |
| **Actor** | User |
| **Description** | A logged-in user submits an answer to an existing question |
| **Precondition** | User is logged in. Question exists and is Approved. |
| **Postcondition** | Answer saved with Status = Pending. Admin receives real-time notification. |

**Main Flow:**
1. User opens a question detail page
2. User scrolls to the Your Answer section
3. User types their answer in the textarea
4. User optionally attaches images
5. User clicks Submit Answer
6. System validates answer is not empty
7. Angular creates a `FormData` object
8. `authInterceptor` attaches JWT token
9. System sends `POST /api/questions/{id}/answers` to the backend
10. Backend saves answer with Status = Pending
11. Backend saves any uploaded images
12. Backend fires SignalR `NewAnswer` event to all connected admins
13. System displays "Answer submitted! Waiting for admin approval."

**Alternate Flow — Empty Answer:**
- At step 6, if textarea is empty, error "Answer cannot be empty" is shown
- Form is not submitted

---

### UC-08 — Upload Image

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-08 |
| **Use Case Name** | Upload Image |
| **Actor** | User |
| **Description** | A user attaches one or more images to a question or answer |
| **Precondition** | User is filling in the Ask Question or Answer form |
| **Postcondition** | Images are stored on the server and linked to the question or answer in the database |

**Main Flow:**
1. User clicks Choose File in the question or answer form
2. User selects one or more image files
3. Files are stored in the Angular component
4. When form is submitted, files are appended to `FormData`
5. Backend receives files as `List<IFormFile>`
6. Backend generates a unique filename using `Guid.NewGuid()`
7. File is saved to `wwwroot/uploads/`
8. File path `/uploads/filename` is saved to the Images table
9. Images are served at `https://localhost:7165/uploads/filename`
10. Images are displayed inline on the question detail page

---

### UC-09 — Add Question to Favourites

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-09 |
| **Use Case Name** | Add Question to Favourites |
| **Actor** | User |
| **Description** | A logged-in user saves a question to their favourites list |
| **Precondition** | User is logged in (not admin). User is on the home page. |
| **Postcondition** | Question ID is saved to localStorage. Heart icon turns pink. Navbar badge count increases. |

**Main Flow:**
1. User sees a question card on the home page with a heart icon (♡)
2. User clicks the heart icon
3. `FavouriteService.toggleFavourite()` is called
4. Question ID is added to the `doconnect_favourites` array in localStorage
5. Heart icon turns pink (♥)
6. Navbar Favourites badge count increases by 1

**Alternate Flow — Remove from Favourites:**
- If question is already favourited, clicking heart removes it from localStorage
- Heart turns back to outline (♡)
- Badge count decreases

---

### UC-10 — View Favourites

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-10 |
| **Use Case Name** | View Favourites |
| **Actor** | User |
| **Description** | A logged-in user views all their saved favourite questions |
| **Precondition** | User is logged in. User has at least one question saved. |
| **Postcondition** | List of saved questions is displayed |

**Main Flow:**
1. User clicks Favourites in the navbar
2. System checks `authGuard` — confirms user is logged in
3. User is directed to `/favourites`
4. `FavouriteService.getFavouriteIds()` reads saved IDs from localStorage
5. System loads all approved questions from `GET /api/questions`
6. Questions matching saved IDs are displayed
7. Each card has a Remove button and clicking it redirects to question detail

**Alternate Flow — No Favourites:**
- If localStorage has no saved IDs, "No favourite questions yet" message is shown with a Browse Questions button

---

### UC-11 — Admin Login

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-11 |
| **Use Case Name** | Admin Login |
| **Actor** | Admin |
| **Description** | The admin logs into the platform with elevated privileges |
| **Precondition** | Admin account exists in the database (seeded by default) |
| **Postcondition** | Admin is authenticated with Role = Admin. Redirected to `/admin`. |

**Main Flow:**
1. Admin navigates to `/login`
2. Admin enters `admin@doconnect.com` and `Admin@123`
3. System sends `POST /api/auth/login`
4. Backend returns JWT token with Role = Admin
5. Angular stores token in localStorage
6. Angular reads Role from token — redirects to `/admin`
7. Admin dashboard loads with all questions, answers, and stats

---

### UC-12 — View All Questions (Admin)

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-12 |
| **Use Case Name** | View All Questions |
| **Actor** | Admin |
| **Description** | Admin views all questions regardless of approval status |
| **Precondition** | Admin is logged in and on the Admin Dashboard |
| **Postcondition** | All questions with their status, images, and author are displayed |

**Main Flow:**
1. Admin navigates to `/admin`
2. System checks `adminGuard` — confirms user has Role = Admin
3. System sends `GET /api/questions/admin/all` with JWT token
4. Backend returns all questions — Pending, Approved, and Rejected
5. Questions are displayed with status badges — yellow for Pending, green for Approved, red for Rejected
6. Images attached to questions are visible on each card
7. Approve, Reject, and Delete buttons appear on Pending questions

---

### UC-13 — Approve or Reject Question

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-13 |
| **Use Case Name** | Approve or Reject Question |
| **Actor** | Admin |
| **Description** | Admin reviews a pending question and approves or rejects it |
| **Precondition** | Admin is logged in. Question has Status = Pending. |
| **Postcondition** | Question Status is updated to Approved or Rejected. |

**Main Flow:**
1. Admin views a Pending question on the dashboard
2. Admin reviews the content and any attached images
3. Admin clicks Approve or Reject
4. System sends `PATCH /api/questions/{id}/status` with body `{ "action": "Approve" }` or `{ "action": "Reject" }`
5. Backend updates question Status accordingly
6. If Approved — question becomes visible to all users on the home page
7. If Rejected — question is hidden from public view
8. Dashboard refreshes to show updated status

---

### UC-14 — Approve or Reject Answer

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-14 |
| **Use Case Name** | Approve or Reject Answer |
| **Actor** | Admin |
| **Description** | Admin reviews a pending answer and approves or rejects it |
| **Precondition** | Admin is logged in. Answer has Status = Pending. |
| **Postcondition** | Answer Status is updated to Approved or Rejected. |

**Main Flow:**
1. Admin clicks the Answers tab on the dashboard
2. Admin views a Pending answer with content and any attached images
3. Admin clicks Approve or Reject
4. System sends `PATCH /api/answers/{id}/status`
5. Backend updates answer Status
6. If Approved — answer becomes visible on the question detail page
7. If Rejected — answer is hidden from public view
8. Dashboard refreshes

---

### UC-15 — Delete Question

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-15 |
| **Use Case Name** | Delete Question |
| **Actor** | Admin |
| **Description** | Admin permanently deletes an inappropriate question and all its associated content |
| **Precondition** | Admin is logged in. Question exists in the database. |
| **Postcondition** | Question, its answers, and all associated images are permanently removed from the database. |

**Main Flow:**
1. Admin finds a question on the dashboard
2. Admin clicks the Delete button
3. System shows a confirmation dialog — "Are you sure you want to delete this question?"
4. Admin clicks OK
5. System sends `DELETE /api/questions/{id}` with JWT token
6. Backend loads the question with its images
7. Backend deletes all associated images from the database first
8. Backend deletes the question (answers are cascade deleted)
9. Dashboard refreshes — question is no longer listed

**Alternate Flow — Admin Cancels:**
- At step 4, if Admin clicks Cancel, nothing happens
- Question remains in the database

---

### UC-16 — Delete Answer

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-16 |
| **Use Case Name** | Delete Answer |
| **Actor** | Admin |
| **Description** | Admin permanently deletes an inappropriate answer |
| **Precondition** | Admin is logged in. Answer exists in the database. |
| **Postcondition** | Answer and all its associated images are permanently removed from the database. |

**Main Flow:**
1. Admin clicks the Answers tab on the dashboard
2. Admin finds an answer and clicks Delete
3. System shows confirmation dialog — "Are you sure you want to delete this answer?"
4. Admin clicks OK
5. System sends `DELETE /api/answers/{id}` with JWT token
6. Backend loads the answer with its images
7. Backend deletes all associated images from the Images table first
8. Backend deletes the answer record
9. Dashboard refreshes — answer is no longer listed

**Alternate Flow — Admin Cancels:**
- At step 4, if Admin clicks Cancel, nothing happens

---

### UC-17 — Receive Real-Time Notifications

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-17 |
| **Use Case Name** | Receive Real-Time Notifications |
| **Actor** | Admin |
| **Description** | Admin receives instant notifications when a user posts a new question or answer |
| **Precondition** | Admin is logged in and on the Admin Dashboard. SignalR connection is active. |
| **Postcondition** | Notification appears in the dashboard panel and navbar badge count increases. |

**Main Flow:**
1. Admin logs in and navigates to `/admin`
2. Angular `NotificationService` connects to `/hubs/notifications` via WebSocket
3. Admin joins the `Admins` SignalR group by calling `JoinAdminGroup()`
4. A user posts a new question on another browser tab
5. Backend fires `NewQuestion` event to the `Admins` group
6. Admin's browser receives the event instantly
7. Notification message appears in the yellow notification panel on the dashboard
8. Red badge counter on the Admin navbar link increases by 1
9. Admin clicks Clear All to dismiss all notifications

**Alternate Flow — User Posts an Answer:**
- At step 4, if a user posts an answer instead
- Backend fires `NewAnswer` event
- Same notification flow applies with the question title mentioned

---

## Use Case Diagram Summary

```
                    ┌─────────────────────────────────┐
                    │         DoConnect System         │
                    │                                  │
  ┌──────┐          │  UC-01 Register                  │
  │Guest │─────────▶│  UC-05 Search Questions          │
  └──────┘          │  UC-06 View Question Detail      │
                    │                                  │
  ┌──────┐          │  UC-02 Login                     │
  │      │─────────▶│  UC-03 Logout                    │
  │      │          │  UC-04 Ask Question              │
  │ User │─────────▶│  UC-05 Search Questions          │
  │      │          │  UC-06 View Question Detail      │
  │      │─────────▶│  UC-07 Answer Question           │
  │      │─────────▶│  UC-08 Upload Image              │
  │      │─────────▶│  UC-09 Add to Favourites         │
  └──────┘─────────▶│  UC-10 View Favourites           │
                    │                                  │
  ┌───────┐         │  UC-11 Admin Login               │
  │       │────────▶│  UC-12 View All Questions        │
  │ Admin │────────▶│  UC-13 Approve/Reject Question   │
  │       │────────▶│  UC-14 Approve/Reject Answer     │
  │       │────────▶│  UC-15 Delete Question           │
  │       │────────▶│  UC-16 Delete Answer             │
  └───────┘────────▶│  UC-17 Receive Notifications     │
                    └─────────────────────────────────┘
```

---

## Preconditions Summary

| Use Case | Key Precondition |
|----------|-----------------|
| UC-01 | Not already registered |
| UC-02 | Account exists |
| UC-03 | Currently logged in |
| UC-04 | Logged in as User |
| UC-05 | None — open to all |
| UC-06 | Question is Approved |
| UC-07 | Logged in, question is Approved |
| UC-08 | Filling in question or answer form |
| UC-09 | Logged in as User (not Admin) |
| UC-10 | Logged in as User |
| UC-11 | Admin account exists |
| UC-12 | Logged in as Admin |
| UC-13 | Logged in as Admin, question is Pending |
| UC-14 | Logged in as Admin, answer is Pending |
| UC-15 | Logged in as Admin |
| UC-16 | Logged in as Admin |
| UC-17 | Logged in as Admin, on dashboard |
