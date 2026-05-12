require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

const authRoutes     = require('./modules/auth/auth.routes');
const menuRoutes     = require('./modules/menu/menu.routes');
const roleRoutes     = require('./modules/role/role.routes');
const employeeRoutes = require('./modules/employee/employee.routes');
const employeeCtrl   = require('./modules/employee/employee.controller');
const { authenticate } = require('./middleware/auth');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

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
