import dotenv from 'dotenv';
dotenv.config();    
import { Client } from 'pg';

let db;

if (process.env.DATABASE_URL) {
  // ✅ Render/Production
  db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // ✅ Local Development
  db = new Client({
    database: process.env.DATABASE_NAME,
    user: process.env.DB_USER,
    password: String(process.env.PASSWORD),
    host: process.env.HOST,
    port: parseInt(process.env.DB_PORT),
  });
}

const connectDB = async () => {
  try {
    await db.connect();
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const setupTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS habit_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES habit_users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS completions (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
        completed_date DATE NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, completed_date)
      );
    `);

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

export { connectDB, setupTables, db };
