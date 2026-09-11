import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// In-memory mock database
type AccountStatus = 'pending' | 'approved' | 'rejected';

interface UserAccount {
  id: string;
  username: string;
  password: string; // Stored in plain text for demonstration purposes as requested, NEVER do this in production
  submittedInfo: string;
  status: AccountStatus;
  rejectionReason?: string;
  createdAt: number;
}

const db: { accounts: UserAccount[] } = {
  accounts: [],
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Client Login / Registration
  app.post('/api/auth/login', (req, res) => {
    const { username, password, submittedInfo } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if account already exists
    let account = db.accounts.find(a => a.username === username);

    if (account) {
      if (account.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      // If logging in, return current status
      return res.json({ account });
    }

    // If account doesn't exist, create it as pending
    account = {
      id: Math.random().toString(36).substring(2, 9),
      username,
      password,
      submittedInfo: submittedInfo || '',
      status: 'pending',
      createdAt: Date.now(),
    };
    db.accounts.push(account);
    
    return res.status(201).json({ account });
  });

  // Client Status Check
  app.get('/api/auth/status/:id', (req, res) => {
    const account = db.accounts.find(a => a.id === req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json({ account });
  });

  // Admin: Get all accounts
  app.get('/api/admin/accounts', (req, res) => {
    // In a real app, verify admin session/token here
    // Sorting by newest first
    const sorted = [...db.accounts].sort((a, b) => b.createdAt - a.createdAt);
    res.json({ accounts: sorted });
  });

  // Admin: Update account status
  app.post('/api/admin/accounts/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const account = db.accounts.find(a => a.id === id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required when rejecting' });
    }

    account.status = status;
    if (status === 'rejected') {
      account.rejectionReason = rejectionReason;
    } else {
      delete account.rejectionReason;
    }

    res.json({ account });
  });


  // --- Vite Middleware (for Development) / Static Serving (for Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
