# TeamFlow - Team Task Management Application

TeamFlow is a full-stack, collaborative team task management application built with Next.js, MongoDB, and Tailwind CSS. It features a modern, premium user interface with Kanban boards, role-based access control, and comprehensive task management.

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (RESTful APIs)
- **Database**: MongoDB (Mongoose)
- **Authentication**: NextAuth.js (JWT-based credentials)

## Features
- **Authentication**: Secure Signup and Login using JWT sessions.
- **Premium UI**: Award-winning design featuring glassmorphism, smooth micro-animations, and dynamic gradient backgrounds.
- **Project Management**: Create projects, view aggregate task statistics, and manage team members.
- **Kanban Board**: Drag-and-drop styled Kanban board for managing tasks across To Do, In Progress, and Done.
- **Role-Based Access**: Project creators are automatically assigned as ADMIN and can create/assign tasks.

## Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd team-task-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   # Your MongoDB Connection String
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/team-task-manager?retryWrites=true&w=majority"
   
   # A secure random string for JWT encryption
   NEXTAUTH_SECRET="super-secret-string-for-next-auth-12345"
   
   # The URL of your application
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to view the application.

## Deployment to Railway (Mandatory Requirement)

Railway is excellent for deploying Next.js applications seamlessly.

1. Create an account on [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select this repository.
4. Add the required Environment Variables in the Railway Dashboard (Variables tab):
   - `MONGODB_URI` (You can provision a MongoDB plugin directly in Railway or use MongoDB Atlas)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (Set this to the public domain Railway assigns to your app)
5. Railway will automatically detect it's a Next.js application and run `npm run build` and `npm start`.

Once deployed, your app will be publicly accessible via the Railway-provided URL!
