require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addUsers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Начинаем транзакцию

    for (let i = 0; i < 1000; i++) {
      const firstName = `FirstName${i}`;
      const lastName = `LastName${i}`;
      const age = +Math.floor(Math.random() * 100);
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const problem = Math.random() > 0.5;

      // Генерируем SQL-запрос для вставки пользователя
      const queryText = `
        INSERT INTO "users" ("firstName", "lastName", age, gender, problem) VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [firstName, lastName, age, gender, problem];

      await client.query(queryText, values);
    }

    await client.query('COMMIT'); // Фиксируем транзакцию
  } catch (err) {
    await client.query('ROLLBACK'); // Откатываем транзакцию в случае ошибки
    console.error('Error adding users', err);
  } finally {
    client.release(); // Освобождаем клиент
  }
}

addUsers()
  .then(() => console.log('Users added successfully'))
  .catch(err => console.error('Error adding users', err));
