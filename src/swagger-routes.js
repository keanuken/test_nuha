/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login karyawan
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login berhasil (single role) atau perlu pilih role (multi-role)
 *         content:
 *           application/json:
 *             examples:
 *               single_role:
 *                 summary: Single role — langsung dapat token
 *                 value:
 *                   success: true
 *                   message: Login berhasil
 *                   data:
 *                     requires_role_selection: false
 *                     access_token: eyJhbGci...
 *                     refresh_token: eyJhbGci...
 *                     token_type: Bearer
 *                     expires_in: 3600
 *                     employee: { id: uuid, name: Administrator, username: admin }
 *                     active_role: { id: uuid, name: Super Admin }
 *               multi_role:
 *                 summary: Multi-role — perlu pilih role dulu
 *                 value:
 *                   success: true
 *                   message: Login berhasil
 *                   data:
 *                     requires_role_selection: true
 *                     temp_token: eyJhbGci...
 *                     roles:
 *                       - { id: uuid-1, name: Manager }
 *                       - { id: uuid-2, name: Staff }
 *       401:
 *         description: Username atau password salah
 *
 * /api/auth/select-role:
 *   post:
 *     tags: [Auth]
 *     summary: Pilih role (untuk karyawan multi-role)
 *     description: Gunakan temp_token dari response login sebagai Bearer token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SelectRoleRequest'
 *     responses:
 *       200:
 *         description: Role dipilih, dapat access token penuh
 *       403:
 *         description: Role tidak valid untuk karyawan ini
 *
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Token baru
 *       401:
 *         description: Refresh token tidak valid
 *
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     responses:
 *       200:
 *         description: Logout berhasil
 *
 * /api/me/profile:
 *   get:
 *     tags: [Me]
 *     summary: Get profile karyawan yang sedang login
 *     responses:
 *       200:
 *         description: Data profile + daftar role
 *
 * /api/me/menus:
 *   get:
 *     tags: [Me]
 *     summary: Get menu tree sesuai role aktif
 *     responses:
 *       200:
 *         description: Nested menu tree
 *
 * /api/menus:
 *   get:
 *     tags: [Menu]
 *     summary: List semua menu (flat)
 *     responses:
 *       200:
 *         description: Daftar menu
 *   post:
 *     tags: [Menu]
 *     summary: Buat menu baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuRequest'
 *     responses:
 *       201:
 *         description: Menu berhasil dibuat
 *
 * /api/menus/tree:
 *   get:
 *     tags: [Menu]
 *     summary: Get menu tree (nested, semua role)
 *     responses:
 *       200:
 *         description: Nested menu tree
 *
 * /api/menus/{id}:
 *   put:
 *     tags: [Menu]
 *     summary: Update menu
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuRequest'
 *     responses:
 *       200:
 *         description: Menu diupdate
 *   delete:
 *     tags: [Menu]
 *     summary: Hapus menu
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Menu dihapus
 *
 * /api/roles:
 *   get:
 *     tags: [Role]
 *     summary: List semua role
 *     responses:
 *       200:
 *         description: Daftar role
 *   post:
 *     tags: [Role]
 *     summary: Buat role baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleRequest'
 *     responses:
 *       201:
 *         description: Role dibuat
 *
 * /api/roles/{id}:
 *   put:
 *     tags: [Role]
 *     summary: Update role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleRequest'
 *     responses:
 *       200:
 *         description: Role diupdate
 *   delete:
 *     tags: [Role]
 *     summary: Hapus role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Role dihapus
 *
 * /api/roles/{id}/menus:
 *   get:
 *     tags: [Role]
 *     summary: Get menu yang di-assign ke role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Daftar menu
 *   post:
 *     tags: [Role]
 *     summary: Assign menu ke role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menu_id: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Menu di-assign
 *
 * /api/roles/{id}/menus/{menuId}:
 *   delete:
 *     tags: [Role]
 *     summary: Revoke menu dari role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Menu di-revoke
 *
 * /api/employees:
 *   get:
 *     tags: [Employee]
 *     summary: List semua karyawan
 *     responses:
 *       200:
 *         description: Daftar karyawan
 *   post:
 *     tags: [Employee]
 *     summary: Buat karyawan baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeRequest'
 *     responses:
 *       201:
 *         description: Karyawan dibuat
 *
 * /api/employees/{id}:
 *   put:
 *     tags: [Employee]
 *     summary: Update karyawan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeRequest'
 *     responses:
 *       200:
 *         description: Karyawan diupdate
 *   delete:
 *     tags: [Employee]
 *     summary: Hapus karyawan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Karyawan dihapus
 *
 * /api/employees/{id}/roles:
 *   get:
 *     tags: [Employee]
 *     summary: Get role karyawan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Daftar role
 *   post:
 *     tags: [Employee]
 *     summary: Assign role ke karyawan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Role di-assign
 *
 * /api/employees/{id}/roles/{roleId}:
 *   delete:
 *     tags: [Employee]
 *     summary: Revoke role dari karyawan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Role di-revoke
 */
