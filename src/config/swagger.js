const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nuha Backend API',
      version: '1.0.0',
      description: 'API dokumentasi untuk modul Login & Management Access — PT Data Integrasi Inovasi (nuha.care)',
      contact: { name: 'Keanu Jaler Pangestu', email: 'keanujalerr.kj@gmail.com' },
    },
    servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        LoginRequest: {
          type: 'object', required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'admin123' },
          },
        },
        SelectRoleRequest: {
          type: 'object', required: ['role_id'],
          properties: { role_id: { type: 'string', format: 'uuid' } },
        },
        RefreshRequest: {
          type: 'object', required: ['refresh_token'],
          properties: { refresh_token: { type: 'string' } },
        },
        MenuRequest: {
          type: 'object', required: ['name'],
          properties: {
            name: { type: 'string', example: 'Dashboard' },
            icon: { type: 'string', example: 'dashboard' },
            path: { type: 'string', example: '/dashboard' },
            parentId: { type: 'string', format: 'uuid', nullable: true },
            order: { type: 'integer', example: 1 },
          },
        },
        RoleRequest: {
          type: 'object', required: ['name'],
          properties: {
            name: { type: 'string', example: 'Manager' },
            description: { type: 'string', example: 'Akses menu operasional' },
          },
        },
        EmployeeRequest: {
          type: 'object', required: ['username', 'password', 'name'],
          properties: {
            username: { type: 'string', example: 'john.doe' },
            password: { type: 'string', example: 'secret123' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@nuha.care' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Login, select role, refresh token' },
      { name: 'Me', description: 'Profile & menu karyawan yang sedang login' },
      { name: 'Menu', description: 'Management menu (CRUD + tree)' },
      { name: 'Role', description: 'Management role + assign menu' },
      { name: 'Employee', description: 'Management karyawan + assign role' },
    ],
  },
  apis: ['./src/modules/**/*.routes.js', './src/swagger-routes.js'],
};

module.exports = swaggerJsdoc(options);
