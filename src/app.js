require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes     = require('./modules/auth/auth.routes');
const menuRoutes     = require('./modules/menu/menu.routes');
const roleRoutes     = require('./modules/role/role.routes');
const employeeRoutes = require('./modules/employee/employee.routes');
const employeeCtrl   = require('./modules/employee/employee.controller');
const { authenticate } = require('./middleware/auth');

const app = express();

// Trust proxy — biar req.get('host') baca X-Forwarded-Host dari Tailscale
app.set('trust proxy', true);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.static('public'));

// Swagger UI — fetch spec dari /api-docs.json (dynamic, ikut PUBLIC_URL)
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(null, {
  customSiteTitle: 'Nuha API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1e40af; }',
  swaggerOptions: {
    url: '/api-docs.json',
  },
}));
app.get('/api-docs.json', (req, res) => {
  const baseUrl = process.env.PUBLIC_URL ||
    `${req.get('x-forwarded-proto') || req.protocol}://${req.get('x-forwarded-host') || req.get('host')}`;
  const spec = { ...swaggerSpec };
  spec.servers = [{ url: baseUrl, description: 'Current server' }];
  res.json(spec);
});

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/menus',     menuRoutes);
app.use('/api/roles',     roleRoutes);
app.use('/api/employees', employeeRoutes);

// Me routes
app.get('/api/me/profile', authenticate, employeeCtrl.getProfile);
app.get('/api/me/menus',   authenticate, employeeCtrl.getMyMenus);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 API routes
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' }));

// SPA fallback — semua non-API route ke index.html
app.use((req, res) => res.sendFile('index.html', { root: 'public' }));

// Error handler
app.use(errorHandler);

module.exports = app;
