import pool from './db.js';
import bcryptjs from 'bcryptjs';

function getNextSaturdays(count) {
  const dates = [];
  let d = new Date();
  // If today is Saturday and before midnight, include today
  if (d.getDay() === 6) {
    dates.push(new Date(d));
    count--;
  }
  // Find next Saturday
  d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
  if (d.getDay() !== 6) d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
  for (let i = 0; i < count; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  // Deduplicate
  const unique = [...new Set(dates.map(dt => dt.toISOString().split('T')[0]))];
  return unique.slice(0, count + 1);
}

async function setup() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting database setup...\n');

    // Create extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ Extensions created');

    // Drop old tables (clean slate)
    await client.query('DROP TABLE IF EXISTS bookings CASCADE;');
    await client.query('DROP TABLE IF EXISTS schedules CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    await client.query('DROP TABLE IF EXISTS invite_tokens CASCADE;');
    console.log('✅ Old tables dropped');

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefone TEXT,
        banda TEXT,
        senha TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create invite_tokens table
    await client.query(`
      CREATE TABLE invite_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        token TEXT UNIQUE NOT NULL,
        created_by UUID REFERENCES users(id),
        used_by UUID REFERENCES users(id),
        used_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Invite tokens table created');

    // Create schedules table
    await client.query(`
      CREATE TABLE schedules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        data_sabado DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fim TIME NOT NULL,
        UNIQUE(data_sabado, hora_inicio)
      );
    `);
    console.log('✅ Schedules table created');

    // Create bookings table
    await client.query(`
      CREATE TABLE bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(schedule_id)
      );
    `);
    console.log('✅ Bookings table created');

    // ==================
    // SEED DATA
    // ==================
    console.log('\n🌱 Seeding data...\n');

    // Hash passwords
    const adminHash = await bcryptjs.hash('admin123', 10);
    const banda1Hash = await bcryptjs.hash('banda123', 10);
    const banda2Hash = await bcryptjs.hash('banda123', 10);

    // Create Super Admin
    const adminResult = await client.query(`
      INSERT INTO users (nome, email, telefone, banda, senha, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `, ['Administrador', 'admin@igreja.com', '(11) 99999-0000', null, adminHash, 'admin']);
    console.log('👑 Super Admin criado: admin@igreja.com / admin123');

    // Create Test Band 1
    const banda1Result = await client.query(`
      INSERT INTO users (nome, email, telefone, banda, senha, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `, ['David Lima', 'david@igreja.com', '(11) 98888-1111', 'Banda Gratidão', banda1Hash, 'user']);
    console.log('🎸 Banda Teste 1 criada: david@igreja.com / banda123');

    // Create Test Band 2
    const banda2Result = await client.query(`
      INSERT INTO users (nome, email, telefone, banda, senha, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `, ['Maria Santos', 'maria@igreja.com', '(11) 97777-2222', 'Ministério Zoe', banda2Hash, 'user']);
    console.log('🎤 Banda Teste 2 criada: maria@igreja.com / banda123');

    // Seed schedules - next 8 Saturdays
    const times = [
      { start: '08:00', end: '09:00' },
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '18:00', end: '19:00' },
      { start: '19:00', end: '20:00' },
    ];

    const saturdays = getNextSaturdays(8);
    let scheduleCount = 0;
    
    for (const day of saturdays) {
      for (const t of times) {
        await client.query(`
          INSERT INTO schedules (data_sabado, hora_inicio, hora_fim)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING;
        `, [day, t.start + ':00', t.end + ':00']);
        scheduleCount++;
      }
    }
    console.log(`📅 ${scheduleCount} slots criados para ${saturdays.length} sábados`);

    // Create a sample booking for Banda Gratidão on the first Saturday
    const firstSchedule = await client.query(
      'SELECT id FROM schedules ORDER BY data_sabado, hora_inicio LIMIT 1'
    );
    if (firstSchedule.rows.length > 0) {
      await client.query(`
        INSERT INTO bookings (user_id, schedule_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `, [banda1Result.rows[0].id, firstSchedule.rows[0].id]);
      console.log('📌 Reserva de exemplo criada para Banda Gratidão');
    }

    // Create an invite token for testing
    const inviteToken = 'convite-teste-2024';
    await client.query(`
      INSERT INTO invite_tokens (token, created_by, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '30 days');
    `, [inviteToken, adminResult.rows[0].id]);
    console.log(`🔗 Token de convite criado: ${inviteToken}`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Setup completo!\n');
    console.log('📋 Credenciais de acesso:');
    console.log('─'.repeat(40));
    console.log('👑 ADMIN:    admin@igreja.com    / admin123');
    console.log('🎸 BANDA 1:  david@igreja.com    / banda123');
    console.log('🎤 BANDA 2:  maria@igreja.com    / banda123');
    console.log('🔗 CONVITE:  convite-teste-2024');
    console.log('─'.repeat(40));
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

setup();
