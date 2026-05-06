TeamFlow - Team Task Manager
=============================

Hey! This is a full-stack web app I built to help teams manage projects and tasks together.
It's built with the MERN stack (MongoDB, Express, React, Node.js) and has proper auth,
role-based permissions, and a dashboard with charts.


-------------------------------------------------------------------
What it does
-------------------------------------------------------------------

- Sign up / log in with JWT-based authentication
- Create projects and invite team members by email
- Assign tasks with priorities, due dates, and statuses
- Kanban-style board (To Do / In Progress / Done)
- Dashboard with charts showing task progress per member
- Admins control everything; members can only update their task status
- Overdue task detection


-------------------------------------------------------------------
Tech used
-------------------------------------------------------------------

Backend:
  - Node.js + Express.js
  - MongoDB + Mongoose
  - JWT (stored in HTTP-only cookies)
  - bcryptjs for password hashing
  - Joi for request validation

Frontend:
  - React 18 + Vite
  - Tailwind CSS
  - Zustand (auth state)
  - React Query (server state / caching)
  - Axios
  - Recharts (pie + bar charts)
  - Lucide React (icons)


-------------------------------------------------------------------
Folder structure
-------------------------------------------------------------------

Team_Task_manager/
  backend/
    controllers/      <- all the business logic lives here
    models/           <- Mongoose schemas (User, Project, Task)
    routes/           <- Express route files
    middlewares/      <- auth check, role check, error handler
    utils/            <- token helpers, Joi validators
    server.js
    .env.example

  client/
    src/
      api/            <- Axios API call functions
      components/     <- reusable UI pieces
      pages/          <- full page components
      store/          <- Zustand auth store


-------------------------------------------------------------------
How to run it locally
-------------------------------------------------------------------

You'll need Node.js 18+ and a MongoDB Atlas account (free tier works fine).

1. Clone the repo

2. Set up the backend:

   cd backend
   npm install
   cp .env.example .env

   Open .env and fill in:
     - MONGO_URI      -> your MongoDB Atlas connection string
     - JWT_SECRET     -> any long random string (32+ chars)
     - CLIENT_URL     -> http://localhost:5173 for local dev

   npm run dev        -> runs on http://localhost:5000

3. Set up the frontend:

   cd client
   npm install
   cp .env.example .env

   The default VITE_API_URL points to localhost:5000 which is fine for local.

   npm run dev        -> runs on http://localhost:5173


-------------------------------------------------------------------
Environment variables
-------------------------------------------------------------------

backend/.env

  PORT=5000
  MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/team-task-manager
  JWT_SECRET=some_long_random_secret_here
  JWT_EXPIRES_IN=7d
  CLIENT_URL=http://localhost:5173
  NODE_ENV=development

client/.env

  VITE_API_URL=http://localhost:5000/api


-------------------------------------------------------------------
How the roles work
-------------------------------------------------------------------

When you create a project, you automatically become its Admin.
Anyone you invite becomes a Member.

Admin can:
  - Create, edit, delete tasks
  - Add or remove members
  - Delete the project

Member can:
  - View tasks assigned to them
  - Change the status of their own tasks (To Do / In Progress / Done)
  - Nothing else

The backend enforces this on every request, not just the frontend.


-------------------------------------------------------------------
API overview (quick reference)
-------------------------------------------------------------------

Auth:
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Projects:
  GET    /api/projects
  POST   /api/projects
  GET    /api/projects/:id
  PUT    /api/projects/:id/add-member
  DELETE /api/projects/:id/remove-member
  DELETE /api/projects/:id

Tasks:
  POST   /api/tasks
  GET    /api/tasks/:projectId
  PUT    /api/tasks/:id
  DELETE /api/tasks/:id

Dashboard:
  GET    /api/dashboard/:projectId
    returns: total tasks, tasks by status, overdue count, tasks per member


-------------------------------------------------------------------
Deploying to Railway
-------------------------------------------------------------------

Backend:
  1. Push backend/ to a GitHub repo
  2. Go to railway.app -> New Project -> Deploy from GitHub
  3. Select the repo, set root directory to "backend"
  4. Add all the env variables from .env (use your Atlas URI and a real JWT secret)
  5. Railway gives you a public URL like https://yourapp.up.railway.app

Frontend:
  1. Push client/ to GitHub (same or separate repo)
  2. New Railway project -> Deploy from GitHub
  3. Root directory: "client", build command: npm run build, output: dist
  4. Set VITE_API_URL to your backend Railway URL + /api
  5. Update CLIENT_URL in backend env to match the frontend Railway URL

Or deploy the frontend on Vercel instead - it's a bit easier for static React apps.


-------------------------------------------------------------------
Notes
-------------------------------------------------------------------

- Passwords are hashed with bcrypt (12 rounds), never stored in plain text
- JWTs go in HTTP-only cookies so they're not accessible via JavaScript
  (Bearer token fallback also works for API clients)
- All routes are protected; unauthenticated requests get a 401
- Mongoose validation runs on every write, Joi validates incoming request bodies
- The dashboard uses MongoDB aggregation pipelines for the analytics


-------------------------------------------------------------------
Made by Shivam
-------------------------------------------------------------------
