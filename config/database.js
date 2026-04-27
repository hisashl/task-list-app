const mysql = require('mysql2/promise');

// Azure Database for MySQL requires SSL.
// For a local MySQL instance, set DB_SSL=false in your .env.
const sslOption =
  process.env.DB_SSL === 'false'
    ? undefined
    : { rejectUnauthorized: true };

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslOption,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

module.exports = pool;
