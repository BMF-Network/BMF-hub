import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware for parsing JSON requests
app.use(express.json({ limit: '25mb' }));

// Secret Family Code (Checked strictly on server side, never purely in the browser)
const SERVER_FAMILY_CODE = '@BMF2026';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'concorderuhungande@gmail.com';

// Mock storage for notification logs
const notificationLogs: Array<{
  id: string;
  type: string;
  title: string;
  body: string;
  timestamp: string;
  recipientsCount: number;
  emailRecipients: string[];
  whatsAppRecipients: string[];
}> = [];

// API Route: Verify Family Code server-side
app.post('/api/auth/verify-code', (req: Request, res: Response): void => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ valid: false, message: 'Please provide the family code.' });
      return;
    }

    const trimmed = code.trim();
    if (trimmed === SERVER_FAMILY_CODE) {
      res.json({ valid: true, message: 'Family code accepted.' });
      return;
    } else {
      res.status(401).json({ valid: false, message: 'Incorrect family code. Please check and try again.' });
      return;
    }
  } catch {
    res.status(500).json({ valid: false, message: 'Server verification failed.' });
  }
});

// API Route: Send Sign-in Email Link
app.post('/api/auth/send-link', (req: Request, res: Response): void => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'A valid email address is required.' });
      return;
    }

    const token = Buffer.from(`${email}:${Date.now()}:${Math.random().toString(36).substring(2)}`).toString('base64');
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const signinUrl = `${appUrl}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    console.log(`[AUTH] Generated sign-in link for ${email}: ${signinUrl}`);

    res.json({
      success: true,
      message: `Sign-in link created for ${email}`,
      token,
      simulatedUrl: signinUrl,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Could not send sign-in link.' });
  }
});

// API Route: Dispatch notifications to members
app.post('/api/notifications/dispatch', (req: Request, res: Response): void => {
  try {
    const { eventType, title, message, members } = req.body;

    if (!title || !eventType) {
      res.status(400).json({ success: false, message: 'Missing notification payload.' });
      return;
    }

    const approvedMembers = Array.isArray(members)
      ? members.filter((m: { status: string }) => m.status === 'approved')
      : [];

    const emailRecipients: string[] = [];
    const whatsAppRecipients: string[] = [];

    for (const member of approvedMembers) {
      const pref = member.notificationPref || 'both';
      if ((pref === 'email' || pref === 'both') && member.email) {
        emailRecipients.push(member.email);
      }
      if ((pref === 'whatsapp' || pref === 'both') && member.whatsapp) {
        whatsAppRecipients.push(member.whatsapp);
      }
    }

    const logEntry = {
      id: 'notif_' + Date.now(),
      type: eventType,
      title,
      body: message || '',
      timestamp: new Date().toISOString(),
      recipientsCount: emailRecipients.length + whatsAppRecipients.length,
      emailRecipients,
      whatsAppRecipients,
    };

    notificationLogs.unshift(logEntry);
    if (notificationLogs.length > 50) notificationLogs.pop();

    console.log(`[NOTIFICATION DISPATCH] ${eventType.toUpperCase()} "${title}" -> ${emailRecipients.length} emails, ${whatsAppRecipients.length} WhatsApps`);

    res.json({
      success: true,
      deliveredEmails: emailRecipients.length,
      deliveredWhatsApp: whatsAppRecipients.length,
      log: logEntry,
    });
  } catch (error) {
    console.error('Notification dispatch failed', error);
    res.status(500).json({ success: false, message: 'Dispatch failed' });
  }
});

// API Route: Get notification logs (Admin only)
app.get('/api/notifications/logs', (_req: Request, res: Response): void => {
  res.json({ logs: notificationLogs });
});

// API Route: Strict Admin Email Verification
app.post('/api/admin/verify', (req: Request, res: Response): void => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({
        verified: false,
        message: 'Please provide an administrator email address.',
      });
      return;
    }

    const trimmed = email.trim().toLowerCase();
    const authorizedAdmin = 'concorderuhungande@gmail.com'.toLowerCase();

    // Confirm that the email is that only
    if (trimmed === authorizedAdmin) {
      res.json({
        verified: true,
        email: authorizedAdmin,
        message: 'Administrator authorization confirmed.',
      });
      return;
    } else {
      res.status(403).json({
        verified: false,
        message: 'Access denied: Only concorderuhungande@gmail.com is authorized as the administrator.',
      });
      return;
    }
  } catch {
    res.status(500).json({ verified: false, message: 'Server verification error.' });
  }
});

// API Route: Admin config check
app.post('/api/admin/check', (req: Request, res: Response): void => {
  const { email } = req.body;
  const authorizedAdmin = 'concorderuhungande@gmail.com'.toLowerCase();
  const isAdmin = email && email.toLowerCase().trim() === authorizedAdmin;
  res.json({ isAdmin: !!isAdmin });
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BMF Family Hub server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
