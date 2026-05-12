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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Nuha API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1e40af; }',
}));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

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

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' }));

// Error handler
app.use(errorHandler);

module.exports = app;
