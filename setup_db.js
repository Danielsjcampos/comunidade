const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_8wnWuvH4jhMm@ep-summer-firefly-acjxi0vf-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function setup() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to NeonDB');

    // Create extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefone TEXT,
        banda TEXT,
        senha TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create schedules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        data_sabado DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fim TIME NOT NULL,
        UNIQUE(data_sabado, hora_inicio)
      );
    `);

    // Create bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(schedule_id) -- Only one booking per schedule slot
      );
    `);

    // Seed some schedules (next 4 Saturdays)
    const times = ['08:00', '09:00', '10:00', '18:00', '19:00'];
    
    function getNextSaturdays(count) {
      const dates = [];
      let d = new Date();
      d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
      for (let i = 0; i < count; i++) {
        dates.push(new Date(d));
        d.setDate(d.getDate() + 7);
      }
      return dates.map(d => d.toISOString().split('T')[0]);
    }

    const saturdays = getNextSaturdays(4);
    for (const day of saturdays) {
      for (const time of times) {
        const [h, m] = time.split(':');
        const start = `${h}:${m}:00`;
        const endLine = parseInt(h) + 1;
        const end = `${endLine.toString().padStart(2, '0')}:${m}:00`;
        
        await client.query(`
          INSERT INTO schedules (data_sabado, hora_inicio, hora_fim)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING;
        `, [day, start, end]);
      }
    }

    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.end();
  }
}

setup();
