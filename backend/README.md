# Academic Management System Backend

## Project Overview
The Student Academic Management System backend provides a robust, secure, and highly scalable API for managing academic engagement, student risk profiles, and academic support. It employs fine-grained role-based access control and strict server-side scoping to ensure that data access is restricted to authorized personnel.

## Technology Stack
The backend is built using the following modern web technologies:
- **Node.js** & **Express.js**: For the core server and API routing.
- **MongoDB** & **Mongoose**: For the NoSQL database and schema modeling.
- **JSON Web Tokens (JWT)**: For stateless, secure API authentication.
- **bcrypt**: For secure password hashing.
- **Swagger/OpenAPI**: For interactive API documentation.
- **Postman**: A collection is included for local API testing.

## Architecture
The application follows a standard modular, layered architecture to keep responsibilities clean and isolated.

**Request Lifecycle:**
Request
→ Authentication (Validates JWT)
→ JWT verification (Extracts User ID and Role)
→ Role authorization (Validates `req.user.role` against permitted roles)
→ Scope authorization (Binds database queries to the user's geographic/academic scope)
→ Controller (Handles HTTP Request/Response)
→ Service (Contains Business Logic)
→ Mongoose Model (Executes Indexed DB Queries)
→ MongoDB
→ Response

**Crucial Note:** Authorization and scope filtering are strictly enforced **server-side**. The system strips query parameters (like `campusId` or `branchId`) from incoming requests and forces queries to execute against the user's validated scope mapping.

## Campus Structure
The system is modeled around the following multi-campus structure:

**KIET**
- CSE-AI
- CSE-AI-ML
- CSE-AIDS
- CSE-CYBER
- CSE-DS

**KIET+**
- CSE-AI
- CSE-AI-ML
- CSE-AIDS
- CSE-CYBER
- CSE-DS

**KIET-W**
- CSE-AI
- CSE-AI-ML
- CSE-AIDS

## Role and Scope Model
The API secures data via 6 distinct roles, enforcing tight boundary controls:

- **ADMIN**: Full system access. Can manage configurations like Risk Thresholds.
- **PRINCIPAL**: Campus-level access. Can view all data within their assigned campus.
- **HOD**: Year-wise academic management.
  - For KIET/KIET+: One HOD manages their assigned academic year across *both* KIET and KIET+.
  - For KIET-W: Managed by a separate HOD for their assigned academic year strictly within KIET-W.
- **CTPO**: Assigned section-level access (e.g. 1st Year, Section A).
- **STUDENT**: Permitted access to their own student data only, through dedicated self-service endpoints.

## Modules
The codebase is divided into the following domain-driven modules:
- **Academic Master**: Campuses, Branches, Academic Years, Semesters, Sections, Subjects, Students, Users.
- **Authentication**: Login, JWT issuance.
- **Examination**: Examinations, Timetables.
- **Marks**: Mark entry and retrieval.
- **Results**: Official result tracking.
- **Backlogs**: Dynamic computation of uncleared subjects.
- **Risk Management**: Risk Profiling.
- **Academic Support**:
  - Remedial Classes
  - Remedial Students (Enrollments)
  - Guest Lectures
  - Notifications
- **Supply Applications**: Management of supply exam applications.
- **Risk Thresholds**: Configurable dynamic thresholds for student risk assessment.

## Security
The API integrates multiple security layers:
- **JWT Authentication**: Validates all incoming API requests (except public endpoints like login).
- **bcrypt**: Ensures all user passwords are cryptographically hashed before storage.
- **Role-based Authorization (RBAC)**: Enforces access restrictions at the route level via `authorizeRoles` middleware.
- **Server-side Scope Enforcement**: Uses `getStudentQueryScope(req.user)` to securely filter database results by authorized campus, branch, section, or student ID.
- **Login Failure Tracking & Account Lockout**: Brute-force protection that tracks failed logins and locks accounts temporarily after successive failures.
- **Query-Parameter Scope Bypass Protection**: Client-side attempts to override scope parameters are explicitly ignored.
- **Student Self-Service Protection**: `GET /students/me` explicitly limits the student to their own record; `GET /students` is `403 Forbidden` for students.
- **Administrative Restrictions**: Endpoint configurations such as `Risk Threshold` management are strictly restricted to `ADMIN` and `PRINCIPAL`.

## Database
The system uses MongoDB with Mongoose for Object Data Modeling (ODM).

**Key Relationships:**
- A **User** authenticates into the system and is mapped to a specific role/scope.
- **Campuses**, **Branches**, **Academic Years**, **Semesters**, and **Sections** form the geographical and academic hierarchy.
- A **Student** belongs to a Campus, Branch, Semester, and Section, and is mapped to a User.
- **Marks**, **Results**, **Backlogs**, **Risk Profiles**, and **Supply Applications** are directly tied to a `studentId`.
- **Examinations** are tied to a `semesterId`.
- **Notifications** target a `recipientStudentId`.
- **Remedial Classes** and **Guest Lectures** apply to specific branch/year/section constraints, while **Remedial Students** map a student to a class.
- **Risk Thresholds** are global configuration metrics.

**Indexing:**
To prevent Full Collection Scans (`COLLSCAN`) under heavy loads, native schema indexes have been added to highly queried fields:
- `Student`: Indexes on `{ campusId, branchId, year }`, `sectionId`, and `userId`.
- `Mark`, `Result`, `Backlog`, `RiskProfile`, `RemedialStudent`, `SupplyApplication`: Indexes on `studentId`.
- `Notification`: Index on `recipientStudentId`.
- `Examination`: Index on `semesterId`.

## API Documentation
- **Base URL**: `/api/v1`
- **Authentication**: `POST /api/v1/academic-master/auth/login`
- **Protected Endpoints**: Require a valid JWT passed in the `Authorization: Bearer <token>` header.
- **Swagger Documentation**: Accessible at `/api-docs` when the server is running.
- **Postman Collection**: A comprehensive Postman collection (`postman_collection.json`) is included in the repository for local testing.

## Backend Workflow Example
1. User logs in via `/api/v1/academic-master/auth/login`.
2. Server validates credentials using `bcrypt`.
3. A JWT is generated and returned to the client.
4. The client sends a request to a protected route (e.g., `GET /api/v1/results-backlogs/results`) with the JWT.
5. The `authMiddleware` identifies the user and extracts their role and scope.
6. The `authorizeRoles` middleware validates that the user's role is permitted.
7. Scope logic (`getStudentQueryScope`) intercepts the request and determines the permitted `campusId`/`year`/`sectionId`/`studentId`.
8. The Controller queries the database, passing the strictly scoped filter.
9. The Service processes the request using the Mongoose Models.
10. MongoDB executes the query efficiently using schema indexes.
11. The API sends the secured, scoped response back to the client.

## Testing
The repository contains comprehensive, automated integration scripts to test authorization and security scopes. These scripts verify that the multi-tier role-based filtering (HOD, CTPO, Student, etc.) works flawlessly.

Test scripts included:
- `verify-student-me.js`
- `test-marks-scope.js`
- `test-results-scope.js`
- `test-backlogs-scope.js`
- `test-risk-scope.js`
- `test-remedial-scope.js`
- `test-remedial-students-scope.js`
- `test-guestlectures-scope.js`
- `test-notifications-scope.js`
- `test-examination-scope.js`
- `test-supply-scope.js`
- `test-risk-threshold-scope.js`

**Status:** The latest verification run of these tests achieved a **100% PASS** rate across all modules and roles.

## Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the `.env.example` file to create a local `.env` file:
   *(Never commit the `.env` file to version control).*
   ```bash
   cp .env.example .env
   ```
   Update the variables inside `.env` with your local configurations.

3. **Database Seeding (Optional):**
   If you need to seed the database with mock data:
   ```bash
   npm run seed
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. **Swagger Access:**
   Once the server is running, navigate to `http://localhost:<PORT>/api-docs` to view the interactive API documentation.

## Environment Variables
Reference the `.env.example` file for required configuration variables:
- `PORT`: The port the API will listen on.
- `MONGO_URI`: The MongoDB connection string.
- `JWT_SECRET`: Secret key used for signing JWTs.
- `JWT_EXPIRY`: Token expiration time.
- `NODE_ENV`: The application environment (e.g., `development`, `production`).

## Git / GitHub configuration
- The `.env` file is intentionally ignored by `.gitignore` to prevent secret leaks.
- The `node_modules` directory is ignored.
- The `.env.example` file is committed to provide a template for other developers.
- **Never commit production secrets or `.env` files.**
