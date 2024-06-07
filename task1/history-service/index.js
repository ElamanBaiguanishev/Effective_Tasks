require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const initializeDatabase = async () => {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        user_id INT,
        action VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

  try {
    await pool.query(createTableQuery);
    console.log('Table "history" created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

initializeDatabase();

app.post('/history', async (req, res) => {
  const { user_id, action } = req.body;
  console.log(user_id, action)
  await pool.query('INSERT INTO history (user_id, action) VALUES ($1, $2)', [user_id, action]);
  res.status(201).send();
});

app.get('/history', async (req, res) => {
  const { userId, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query('SELECT * FROM history WHERE user_id = $1 LIMIT $2 OFFSET $3', [userId, limit, offset]);
  res.json(result.rows);
});

app.listen(3001, () => {
  console.log('History service is running on port 3001');
});
