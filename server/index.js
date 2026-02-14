import express from 'express';
import cors from 'cors';
import bcryptjs from 'bcryptjs';
import pool from './db.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from public/uploads
app.use('/uploads', express.static(uploadDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ============================================================
// AUTH ROUTES
// ============================================================

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await pool.query(
      'SELECT id, nome, email, telefone, banda, photo_url, integrantes, senha, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];
    const valid = await bcryptjs.compare(senha, user.senha);

    if (!valid) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Don't return password hash
    const { senha: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/register
app.post('/api/register', async (req, res) => {
  try {
    const { nome, email, telefone, senha, banda, token } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Validate invite token (MANDATORY)
    if (!token) {
      return res.status(400).json({ error: 'Um convite válido é necessário para se cadastrar.' });
    }

    const tokenResult = await pool.query(
      'SELECT id FROM invite_tokens WHERE token = $1 AND used_by IS NULL AND expires_at > NOW()',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Link de convite inválido ou já utilizado.' });
    }


    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }

    const hashedPassword = await bcryptjs.hash(senha, 10);

    const result = await pool.query(`
      INSERT INTO users (nome, email, telefone, banda, senha, role)
      VALUES ($1, $2, $3, $4, $5, 'user')
      RETURNING id, nome, email, telefone, banda, photo_url, integrantes, role;
    `, [nome, email.toLowerCase().trim(), telefone || null, banda || null, hashedPassword]);

    // Mark token as used
    if (token) {
      await pool.query(
        'UPDATE invite_tokens SET used_by = $1, used_at = NOW() WHERE token = $2',
        [result.rows[0].id, token]
      );
    }

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PATCH /api/profile/:id (user updates own profile)
app.patch('/api/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, banda, photo_url, integrantes } = req.body;

    const result = await pool.query(`
      UPDATE users 
      SET nome = COALESCE($1, nome),
          telefone = COALESCE($2, telefone),
          banda = COALESCE($3, banda),
          photo_url = COALESCE($4, photo_url),
          integrantes = COALESCE($5, integrantes)
      WHERE id = $6
      RETURNING id, nome, email, telefone, banda, photo_url, integrantes, role;
    `, [nome, telefone, banda, photo_url, integrantes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// POST /api/upload
app.post('/api/upload', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// ============================================================
// SCHEDULES ROUTES
// ============================================================

// GET /api/schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, data_sabado, hora_inicio::text, hora_fim::text
      FROM schedules
      WHERE data_sabado >= CURRENT_DATE
      ORDER BY data_sabado, hora_inicio;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Schedules error:', err);
    res.status(500).json({ error: 'Erro ao carregar horários' });
  }
});

// ============================================================
// BOOKINGS ROUTES
// ============================================================

// GET /api/bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id,
        b.user_id,
        b.schedule_id,
        b.created_at,
        u.nome as user_name,
        u.banda as banda_name,
        u.photo_url
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN schedules s ON b.schedule_id = s.id
      WHERE s.data_sabado >= CURRENT_DATE
      ORDER BY b.created_at DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Bookings error:', err);
    res.status(500).json({ error: 'Erro ao carregar reservas' });
  }
});

// POST /api/bookings
app.post('/api/bookings', async (req, res) => {
  try {
    const { user_id, schedule_id } = req.body;

    if (!user_id || !schedule_id) {
      return res.status(400).json({ error: 'user_id e schedule_id são obrigatórios' });
    }

    // Check if slot is already booked
    const existing = await pool.query(
      'SELECT id FROM bookings WHERE schedule_id = $1',
      [schedule_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este horário já está reservado' });
    }

    const result = await pool.query(`
      INSERT INTO bookings (user_id, schedule_id)
      VALUES ($1, $2)
      RETURNING id, user_id, schedule_id, created_at;
    `, [user_id, schedule_id]);

    // Fetch user info for the response
    const userInfo = await pool.query(
      'SELECT nome, banda FROM users WHERE id = $1',
      [user_id]
    );

    const booking = {
      ...result.rows[0],
      user_name: userInfo.rows[0]?.nome,
      banda_name: userInfo.rows[0]?.banda
    };

    res.status(201).json(booking);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este horário já está reservado' });
    }
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

// DELETE /api/bookings/:id
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // Verify ownership or admin
    const booking = await pool.query(
      'SELECT b.user_id FROM bookings b WHERE b.id = $1',
      [id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    // Check if user is admin or owner
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [user_id]);
    const isAdmin = user.rows[0]?.role === 'admin';
    const isOwner = booking.rows[0].user_id === user_id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Sem permissão para cancelar esta reserva' });
    }

    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    res.json({ message: 'Reserva cancelada com sucesso' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
});

// ============================================================
// ADMIN ROUTES
// ============================================================

// GET /api/admin/users (admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, telefone, banda, photo_url, integrantes, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Erro ao carregar usuários' });
  }
});

// POST /api/admin/invite (admin only - generate invite link)
app.post('/api/admin/invite', async (req, res) => {
  try {
    const { user_id } = req.body;

    // Verify admin
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [user_id]);
    if (user.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem gerar convites' });
    }

    const token = uuidv4().replace(/-/g, '').substring(0, 16);
    await pool.query(`
      INSERT INTO invite_tokens (token, created_by, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '7 days');
    `, [token, user_id]);

    res.json({ token, link: `${req.headers.origin || 'http://localhost:3000'}/#/register?token=${token}` });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ error: 'Erro ao gerar convite' });
  }
});

// POST /api/admin/schedules (admin only)
app.post('/api/admin/schedules', async (req, res) => {
  try {
    const { user_id, data_sabado, hora_inicio, hora_fim } = req.body;

    // Verify admin
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [user_id]);
    if (user.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem criar datas' });
    }

    if (!data_sabado || !hora_inicio || !hora_fim) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const result = await pool.query(`
      INSERT INTO schedules (data_sabado, hora_inicio, hora_fim)
      VALUES ($1, $2, $3)
      ON CONFLICT (data_sabado, hora_inicio) DO UPDATE 
      SET hora_fim = EXCLUDED.hora_fim
      RETURNING id, data_sabado, hora_inicio::text, hora_fim::text;
    `, [data_sabado, hora_inicio, hora_fim]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json({ error: 'Erro ao criar horário' });
  }
});

// PATCH /api/admin/users/:id (admin only - edit band/user)
app.patch('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, nome, email, telefone, banda, role } = req.body;

    // Verify admin
    const admin = await pool.query('SELECT role FROM users WHERE id = $1', [admin_id]);
    if (admin.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para editar usuários' });
    }

    const result = await pool.query(`
      UPDATE users 
      SET nome = COALESCE($1, nome),
          email = COALESCE($2, email),
          telefone = COALESCE($3, telefone),
          banda = COALESCE($4, banda),
          role = COALESCE($5, role)
      WHERE id = $6
      RETURNING id, nome, email, telefone, banda, role;
    `, [nome, email, telefone, banda, role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// ============================================================
// REAL-TIME POLLING ENDPOINT
// ============================================================

// GET /api/bookings/poll?since=<timestamp>
app.get('/api/bookings/poll', async (req, res) => {
  try {
    const since = req.query.since || new Date(0).toISOString();
    const result = await pool.query(`
      SELECT 
        b.id,
        b.user_id,
        b.schedule_id,
        b.created_at,
        u.nome as user_name,
        u.banda as banda_name,
        u.photo_url
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN schedules s ON b.schedule_id = s.id
      WHERE s.data_sabado >= CURRENT_DATE
      ORDER BY b.created_at DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Poll error:', err);
    res.status(500).json({ error: 'Erro ao atualizar dados' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log('');
  console.log('═'.repeat(50));
  console.log('🚀 Servidor API rodando na porta ' + PORT);
  console.log('📡 API URL: http://localhost:' + PORT + '/api');
  console.log('═'.repeat(50));
  console.log('');
});
