# Academic Engagement System — Team 1: Academic Master Data & Student Management Backend

Team 1 module serves as the foundational core of the complete Academic Engagement, Student Risk & Academic Support Management System.

---

## Central Principles & Architecture

1. **Student as Central Identity**: `Student` is the single central academic identity referenced by `studentId`. Student records do not duplicate `rollNo`, `name`, `branch`, `semester`, or `section`.
2. **Clean Data Separation**: `Student` records do NOT contain marks, results, backlogs, or attendance.
3. **Single Authentication Portal**: Single endpoint `POST /api/auth/login` for all six roles.
4. **Password Security**: Passwords are built using `bcrypt` (salt rounds 10). Plaintext passwords are NEVER stored in MongoDB or returned in any API response.
5. **JWT Authorization**: Bearer tokens are signed with `JWT_SECRET` containing `userId`, `username`, and `role`.

---

## Six System Roles & Access Matrix

| Role | Username | Initial Password | Scope / Access Matrix |
| :--- | :--- | :--- | :--- |
| **STUDENT** | `<rollNo>` | `<rollNo>` | **Own Student Record Only** |
| **CTPO (CSM)** | `2KCT01` | `2KCT01` | **Assigned Section Only** (CSM Section, `scopeRef.type = "SECTION"`) |
| **CTPO (CAI)** | `2KCT02` | `2KCT02` | **Assigned Section Only** (CAI Section, `scopeRef.type = "SECTION"`) |
| **CTPO (CSD)** | `2KCT03` | `2KCT03` | **Assigned Section Only** (CSD Section, `scopeRef.type = "SECTION"`) |
| **CTPO (AID)** | `2KCT04` | `2KCT04` | **Assigned Section Only** (AID Section, `scopeRef.type = "SECTION"`) |
| **CTPO (CSC)** | `2KCT05` | `2KCT05` | **Assigned Section Only** (CSC Section, `scopeRef.type = "SECTION"`) |
| **HOD** | `2KHT01` | `2KHT01` | **ALL Branches**, **4th-Year Data ONLY** (`year = 4`) |
| **PRINCIPAL** | `2KKT01` | `2KKT01` | **Assigned Campus Only** (`scopeRef.type = "CAMPUS"`) |
| **COORDINATOR** | `2KGET01` | `2KGET01` | **ALL Subjects (READ ONLY)** |
| **ADMIN** | `admin_test` | `admin123` | **FULL System / Master-Data Access** |

---

## Environment & Configuration

Create or update `.env` in `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/academic_management
JWT_SECRET=academic_management_secret_key_2026
JWT_EXPIRES_IN=24h
```

---

## Setup & Running Instructions

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Start Backend Server**:
   ```bash
   npm start
   ```
   *Upon database connection, system user seeding (`seedSystemUsers`) automatically migrates/creates non-student user accounts and syncs all existing Student records to User login accounts.*

3. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

---

## Complete API Reference

### Authentication & Self Profile
- `POST /api/auth/login` — Single login endpoint for all 6 roles. Body: `{ "username": "...", "password": "..." }`.
- `GET /api/me` — Returns authenticated user details (requires `Authorization: Bearer <token>`).

### Dashboard Data API
- `GET /api/dashboard` — Returns role-specific MongoDB aggregated backend metrics for the authenticated user.

### Users (Admin Only)
- `GET /api/users` — List all users (omits `passwordHash`).
- `POST /api/users` — Create user with scopeRef & role alignment.
- `PATCH /api/users/:id` — Update user status, role, scopeRef, or password.
- `POST /api/users/sync-students` — Sync missing student user accounts.

### Students (Role & Scope Protected)
- `GET /api/students` — List students filtered by caller role scope.
- `POST /api/students` — Create student (validates `CampusBranchAvailability` and CTPO section scope).
- `GET /api/students/:id` — Get student details by ID (enforces role scope: CTPO section, HOD year 4, Principal campus, Student self).
- `PATCH /api/students/:id` — Update student (CTPO section write enforced).
- `DELETE /api/students/:id` — Delete student (Admin / CTPO section enforced).

### Internal Lookup (Protected, Read-Only)
- `GET /api/internal/students/:id` — Requires JWT. Returns minimal clean student schema:
  ```json
  {
    "rollNo": "23B21A4201",
    "name": "Student Name",
    "campusId": "...",
    "branchId": "...",
    "year": 4,
    "semesterId": "...",
    "sectionId": "..."
  }
  ```

### Master Data APIs (Authenticated / Admin Protected)
- `/api/campuses` (`GET` Authenticated, `POST/PATCH/DELETE` Admin)
- `/api/branches` (`GET` Authenticated, `POST/PATCH/DELETE` Admin)
- `/api/campus-branch-availability` (`GET` Authenticated, `POST/PATCH/DELETE` Admin)
- `/api/academic-years` (`GET` Authenticated, `POST/PATCH/DELETE` Admin)
- `/api/semesters` (`GET` Authenticated, `POST/PATCH/DELETE` Admin)
- `/api/sections` (`GET` Authenticated, `POST/PATCH/DELETE` Admin)
- `/api/subjects` (`GET` Authenticated/Coordinator, `POST/PATCH/DELETE` Admin)
