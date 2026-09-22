# Frontend - Student Academic Management System

This directory contains the React frontend for the Student Academic Management System. It is bootstrapped with Vite and utilizes modern React patterns, Tailwind CSS for styling, and Recharts for data visualization.

## Tech Stack
- **React 18**
- **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling)
- **shadcn/ui** (Accessible UI components)
- **Recharts** (Data Visualization)
- **React Router** (Client-side routing)
- **Axios** (HTTP Client)

## Requirements
- Node.js (v18+)
- npm (v9+)

## Installation & Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the `frontend` root if you need to override the default API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```
   *(By default, the `apiClient.ts` will fallback to `http://localhost:5000/api/v1` if this is not set).*

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   This will start the Vite development server, usually accessible at `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles TypeScript and builds the production bundle.
- `npm run preview`: Bootstraps a local web server to preview the production build.
- `npm run lint`: Runs Oxlint for code quality and style checks.

## Architecture & Navigation
The frontend uses a strictly role-based architecture. Components are grouped primarily by domain/role inside `src/modules/`:
- `src/modules/admin`
- `src/modules/ctpo`
- `src/modules/coordinator`
- `src/modules/hod`
- `src/modules/principal`
- `src/modules/student`

Authentication is protected via `ProtectedRoute` wrappers ensuring users cannot navigate to unauthorized role boundaries.
