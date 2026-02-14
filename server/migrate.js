
import pool from './db.js';

async function migrate() {
  try {
    console.log('Iniciando migração...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS integrantes TEXT;');
    console.log('Migração concluída com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro na migração:', err);
    process.exit(1);
  }
}

migrate();
