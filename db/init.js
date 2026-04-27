const pool = require('../config/database');

async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Database initialized: "tasks" table is ready');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

module.exports = { initializeDatabase };
