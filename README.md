# Multi-User Project Management App - Backend

This repository contains the backend services for the Multi-User Project Management Application. It provides the API endpoints for user authentication, project management, task management, and user interactions.

### Technologies Used

* **Framework:** Node.js (Express-like API)
* **Database:** SQLite (for local development)
* **ORM:** Prisma
* **Authentication:** JSON Web Tokens (JWT)
* **Language:** TypeScript
* **Other:** winston (for logging)

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

* [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
* [npm](https://www.npmjs.com/get-npm) (comes with Node.js) or [Yarn](https://yarnpkg.com/getting-started/install)

### Getting Started

Follow these steps to set up and run the backend locally:

1.  **Clone this repository:**
    ```bash
    git clone [https://github.com/yourusername/sp_fs_yourname_backend.git](https://github.com/yourusername/sp_fs_yourname_backend.git) # Replace with your actual backend repo URL
    cd sp_fs_yourname_backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install # or yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the `backend` directory by copying `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Ensure your `.env` file contains the following (default values are usually fine for local SQLite):
    ```env
    # Server
    PORT=5000
    APP_URL=http://localhost:5000

    # Environment
    NODE_ENV="development"

    # Database
    DATABASE_URL="file:./dev.db" # This points to a SQLite file named dev.db

    # JWT Auth
    JWT_SECRET=eb6f67f77dac0303fe5b8c535e7f7ec44dbaeea23b7799af3d26796cf000b4d6
    ```

4.  **Initialize Prisma Database and Generate Client:**
    This crucial step will:
    * Create the `dev.db` SQLite file if it doesn't exist.
    * Apply your Prisma schema (defined in `prisma/schema.prisma`) to the database.
    * Generate the Prisma Client, which your Node.js application uses to interact with the database.
    ```bash
    npx prisma migrate dev --name init # 'init' is a common name for the first migration
    ```

5.  **Start the Backend Server:**
    ```bash
    npm run dev # or yarn dev
    ```
    The backend server will typically run on `http://localhost:5000`.

### API Endpoints (Example)

The backend provides the following (or similar) API endpoints:

* `POST /api/v1/auth/register` - Register a new user
* `POST /api/v1/auth/login` - Login user and receive JWT
* `GET /api/v1/projects` - Get all projects for the authenticated user
* `POST /api/v1/projects` - Create a new project
* `GET /api/v1/projects/:id` - Get details of a specific project (including tasks and members)
* `POST /api/v1/projects/:id/members` - Invite a member to a project
* `DELETE /api/v1/projects/:id` - Delete a project
* `POST /api/v1/tasks` - Create a new task
* `PUT /api/v1/tasks/detail/:id` - Update a task (e.g., status, assignee)
* `DELETE /api/v1/tasks/:id` - Delete a task

*(Adjust these if your actual endpoints are different)*

---

### Folder Structure

.
├── prisma/               # Prisma schema and migrations
├── src/                  # Backend source code (controllers, services, routes)
├── .env.example          # Backend environment variables example
├── .env                  # Your local environment variables (ignored by Git)
├── package.json          # Backend dependencies
├── package-lock.json     # Node.js dependency lock file
├── logs/                 # Application log files (ignored by Git)
└── README.md             # This file


---

## License

This project is open-sourced under the MIT License.
