import http from 'node:http';
import { URL } from 'node:url';
import { initDatabase } from './db/database.js';
import { ProfileController } from './controllers/profileController.js';
import { TransactionController } from './controllers/transactionController.js';
import { BudgetController } from './controllers/budgetController.js';
import { InvoiceController } from './controllers/invoiceController.js';
import { GoalController } from './controllers/goalController.js';

const PORT = process.env.PORT || 5000;

// Initialize Database on boot
initDatabase();

// CORS Headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// JSON body parser helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// Request dispatcher
const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Helper response wrapper
  const jsonResponse = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      res.writeHead(this.statusCode || 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    }
  };

  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const query = Object.fromEntries(parsedUrl.searchParams.entries());

    // 1. Health check
    if (pathname === '/api/health' && req.method === 'GET') {
      return jsonResponse.json({ status: 'ok', time: new Date().toISOString() });
    }

    // 2. Profiles
    if (pathname === '/api/profiles' && req.method === 'GET') {
      return ProfileController.getAll(req, jsonResponse);
    }

    if (pathname.startsWith('/api/profiles/') && req.method === 'GET') {
      const id = pathname.replace('/api/profiles/', '');
      return ProfileController.getById(req, jsonResponse, id);
    }

    // 3. Financial Summary
    if (pathname === '/api/summary' && req.method === 'GET') {
      const profileId = query.profileId || 'personal';
      return ProfileController.getSummary(req, jsonResponse, profileId);
    }

    // 4. Transactions
    if (pathname === '/api/transactions/categories' && req.method === 'GET') {
      return TransactionController.getCategories(req, jsonResponse, query);
    }

    if (pathname === '/api/transactions') {
      if (req.method === 'GET') {
        return TransactionController.getAll(req, jsonResponse, query);
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        return TransactionController.create(req, jsonResponse, body);
      }
    }

    if (pathname.startsWith('/api/transactions/')) {
      const id = pathname.replace('/api/transactions/', '');
      if (req.method === 'PUT') {
        const body = await parseBody(req);
        return TransactionController.update(req, jsonResponse, id, body);
      }
      if (req.method === 'DELETE') {
        return TransactionController.delete(req, jsonResponse, id);
      }
    }

    // 5. Budgets
    if (pathname === '/api/budgets') {
      if (req.method === 'GET') {
        return BudgetController.getAll(req, jsonResponse, query);
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        return BudgetController.create(req, jsonResponse, body);
      }
    }

    if (pathname.startsWith('/api/budgets/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/budgets/', '');
      return BudgetController.delete(req, jsonResponse, id);
    }

    // 6. Invoices (Empresa)
    if (pathname === '/api/invoices') {
      if (req.method === 'GET') {
        return InvoiceController.getAll(req, jsonResponse, query);
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        return InvoiceController.create(req, jsonResponse, body);
      }
    }

    if (pathname.startsWith('/api/invoices/')) {
      const parts = pathname.split('/').filter(Boolean); // ['api', 'invoices', id, status?]
      const id = parts[2];
      const action = parts[3];

      if (action === 'status' && req.method === 'PATCH') {
        const body = await parseBody(req);
        return InvoiceController.updateStatus(req, jsonResponse, id, body);
      }

      if (req.method === 'DELETE') {
        return InvoiceController.delete(req, jsonResponse, id);
      }
    }

    // 7. Savings Goals (Personal)
    if (pathname === '/api/goals') {
      if (req.method === 'GET') {
        return GoalController.getAll(req, jsonResponse, query);
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        return GoalController.create(req, jsonResponse, body);
      }
    }

    if (pathname.startsWith('/api/goals/')) {
      const parts = pathname.split('/').filter(Boolean); // ['api', 'goals', id, contribute?]
      const id = parts[2];
      const action = parts[3];

      if (action === 'contribute' && req.method === 'POST') {
        const body = await parseBody(req);
        return GoalController.contribute(req, jsonResponse, id, body);
      }

      if (req.method === 'DELETE') {
        return GoalController.delete(req, jsonResponse, id);
      }
    }

    // Not found
    return jsonResponse.status(404).json({ success: false, message: 'Endpoint no encontrado' });

  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor backend de Finanzas ejecutándose en http://localhost:${PORT}`);
});

