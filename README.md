# Task List App

A simple full-stack task list application built with Node.js, Express, MySQL, and vanilla JavaScript with Bootstrap. Deployed to Azure App Service with a MySQL database hosted on Azure.

## Features

- Create new tasks with title and optional description
- View all tasks (newest first, pending tasks above completed ones)
- Toggle tasks between completed and pending
- Delete tasks
- Visual completed state (strikethrough text + "Completed" badge)
- Responsive design (works on mobile)
- Toast notifications for user feedback

## Tech Stack

- **Frontend:** HTML, Bootstrap 5, vanilla JavaScript
- **Backend:** Node.js, Express
- **Database:** MySQL (Azure Database for MySQL)
- **Hosting:** Azure App Service
- **CI/CD:** GitHub Actions

## Project Structure

```
task-list-app/
├── .github/workflows/
│   └── azure-deploy.yml     # CI/CD pipeline
├── config/
│   └── database.js          # MySQL connection pool
├── db/
│   └── init.js              # Creates tasks table on startup
├── public/                  # Static frontend assets
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── routes/
│   └── tasks.js             # Tasks REST API
├── .env.example
├── .gitignore
├── package.json
├── server.js                # Express entry point
└── README.md
```

## API Endpoints

| Method | Endpoint                  | Description                  |
| ------ | ------------------------- | ---------------------------- |
| GET    | `/api/tasks`              | Get all tasks                |
| POST   | `/api/tasks`              | Create a new task            |
| PUT    | `/api/tasks/:id/toggle`   | Toggle completed/pending     |
| DELETE | `/api/tasks/:id`          | Delete a task                |
| GET    | `/health`                 | Health check                 |

## Database Schema

```sql
CREATE TABLE tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

The table is created automatically on first startup by `db/init.js`.

## Local Development

### Prerequisites
- Node.js 18 or newer
- A MySQL database (local or remote)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/task-list-app.git
   cd task-list-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a database:
   ```sql
   CREATE DATABASE tasksdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials. For a local MySQL instance, set `DB_SSL=false`.

5. Start the server:
   ```bash
   npm start
   ```

6. Open http://localhost:3000

## Azure Deployment

### 1. Create Azure resources

**Azure Database for MySQL (Flexible Server):**
1. In the Azure portal, create an "Azure Database for MySQL flexible server".
2. Note the server name, admin username, and password.
3. Under **Networking**, allow access from Azure services and add your IP.
4. Connect and create the database:
   ```sql
   CREATE DATABASE tasksdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

**Azure App Service:**
1. Create an App Service with the **Node 20 LTS** runtime (Linux).
2. Under **Configuration → Application settings**, add:
   - `DB_HOST` = your-server.mysql.database.azure.com
   - `DB_PORT` = 3306
   - `DB_USER` = your_username
   - `DB_PASSWORD` = your_password
   - `DB_NAME` = tasksdb
   - `DB_SSL` = true
3. Under **Configuration → General settings**, set the **Startup Command** to:
   ```
   npm start
   ```

### 2. CI/CD with GitHub Actions

1. Update `AZURE_WEBAPP_NAME` in `.github/workflows/azure-deploy.yml` with your App Service name.
2. Download the publish profile from Azure (App Service → Get publish profile).
3. In your GitHub repo: **Settings → Secrets and variables → Actions**, add a secret named `AZURE_WEBAPP_PUBLISH_PROFILE` with the contents of that file.
4. Push to `main` and the workflow will deploy automatically.

## License

MIT
