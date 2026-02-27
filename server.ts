import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database('handover.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    expiry_date INTEGER
  )
`);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/auth/google/callback`
);

// API Routes
app.get('/api/auth/google/url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'consent'
  });
  res.json({ url });
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    
    // For demo purposes, we'll use a hardcoded user ID
    // In a real app, you'd use a session ID from a cookie
    const userId = 'default_user';
    
    const stmt = db.prepare('INSERT OR REPLACE INTO tokens (id, access_token, refresh_token, expiry_date) VALUES (?, ?, ?, ?)');
    stmt.run(userId, tokens.access_token, tokens.refresh_token, tokens.expiry_date);

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/api/auth/status', (req, res) => {
  const userId = 'default_user';
  const token = db.prepare('SELECT id FROM tokens WHERE id = ?').get(userId);
  res.json({ connected: !!token });
});

app.post('/api/sheets/sync', async (req, res) => {
  const userId = 'default_user';
  const tokenData: any = db.prepare('SELECT * FROM tokens WHERE id = ?').get(userId);

  if (!tokenData) {
    return res.status(401).json({ error: 'Not connected to Google' });
  }

  const { handover, patient } = req.body;

  try {
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // 1. Create a new spreadsheet if one doesn't exist (or use a fixed one for demo)
    // For this demo, we'll create a new one each time or append to a known one if we stored its ID.
    // Let's try to find or create a "Digital Handover" sheet.
    
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Handover - ${patient.name} - ${new Date().toLocaleDateString()}`
        }
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // 2. Prepare data
    const values = [
      ['Kategori', 'Informasi'],
      ['Pasien', patient.name],
      ['Diagnosa', patient.diagnosis],
      ['Waktu Handover', new Date(handover.timestamp).toLocaleString()],
      ['Perawat', `${handover.nurseInCharge} -> ${handover.nurseNextShift}`],
      ['', ''],
      ['SBAR: Situation', handover.sbar.situation],
      ['SBAR: Background', handover.sbar.background],
      ['SBAR: Assessment', handover.sbar.assessment],
      ['SBAR: Recommendation', handover.sbar.recommendation],
      ['', ''],
      ['Instruksi Medis', handover.sbar.latestMedicalInstructions],
      ['Hasil Kritis', handover.sbar.criticalResults],
      ['Alat Kesehatan', handover.sbar.medicalDeviceStatus],
      ['', ''],
      ['Infus: Jenis', handover.physicalExam.infusion.type],
      ['Infus: Sisa', handover.physicalExam.infusion.remainingVolume],
      ['Infus: Tetesan', handover.physicalExam.infusion.dripRate],
      ['Luka/Balutan', handover.physicalExam.wounds],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId!,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: { values }
    });

    res.json({ success: true, url: spreadsheet.data.spreadsheetUrl });
  } catch (error) {
    console.error('Sheets sync error:', error);
    res.status(500).json({ error: 'Failed to sync to Google Sheets' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
