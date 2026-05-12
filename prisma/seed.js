const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Roles ────────────────────────────────────────────────────────────────
  const superAdmin = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: { name: 'Super Admin', description: 'Akses penuh ke semua fitur' },
  });

  const manager = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: { name: 'Manager', description: 'Akses menu operasional' },
  });

  const staff = await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: { name: 'Staff', description: 'Akses menu terbatas' },
  });

  console.log('✅ Roles created');

  // ─── Menus ────────────────────────────────────────────────────────────────
  const dashboard = await prisma.menu.upsert({
    where: { id: 'menu-dashboard' },
    update: {},
    create: { id: 'menu-dashboard', name: 'Dashboard', icon: 'dashboard', path: '/dashboard', order: 1 },
  });

  const masterData = await prisma.menu.upsert({
    where: { id: 'menu-master' },
    update: {},
    create: { id: 'menu-master', name: 'Master Data', icon: 'database', path: null, order: 2 },
  });

  const menuKaryawan = await prisma.menu.upsert({
    where: { id: 'menu-karyawan' },
    update: {},
    create: { id: 'menu-karyawan', name: 'Karyawan', icon: 'users', path: '/master/karyawan', parentId: 'menu-master', order: 1 },
  });

  const menuRole = await prisma.menu.upsert({
    where: { id: 'menu-role' },
    update: {},
    create: { id: 'menu-role', name: 'Role', icon: 'shield', path: '/master/role', parentId: 'menu-master', order: 2 },
  });

  const menuMenu = await prisma.menu.upsert({
    where: { id: 'menu-menu' },
    update: {},
    create: { id: 'menu-menu', name: 'Menu', icon: 'menu', path: '/master/menu', parentId: 'menu-master', order: 3 },
  });

  const laporan = await prisma.menu.upsert({
    where: { id: 'menu-laporan' },
    update: {},
    create: { id: 'menu-laporan', name: 'Laporan', icon: 'file-text', path: null, order: 3 },
  });

  const laporanHarian = await prisma.menu.upsert({
    where: { id: 'menu-laporan-harian' },
    update: {},
    create: { id: 'menu-laporan-harian', name: 'Laporan Harian', icon: 'calendar', path: '/laporan/harian', parentId: 'menu-laporan', order: 1 },
  });

  const laporanBulanan = await prisma.menu.upsert({
    where: { id: 'menu-laporan-bulanan' },
    update: {},
    create: { id: 'menu-laporan-bulanan', name: 'Laporan Bulanan', icon: 'bar-chart', path: '/laporan/bulanan', parentId: 'menu-laporan', order: 2 },
  });

  const pengaturan = await prisma.menu.upsert({
    where: { id: 'menu-pengaturan' },
    update: {},
    create: { id: 'menu-pengaturan', name: 'Pengaturan', icon: 'settings', path: null, order: 4 },
  });

  const profil = await prisma.menu.upsert({
    where: { id: 'menu-profil' },
    update: {},
    create: { id: 'menu-profil', name: 'Profil', icon: 'user', path: '/pengaturan/profil', parentId: 'menu-pengaturan', order: 1 },
  });

  const ubahPassword = await prisma.menu.upsert({
    where: { id: 'menu-password' },
    update: {},
    create: { id: 'menu-password', name: 'Ubah Password', icon: 'lock', path: '/pengaturan/password', parentId: 'menu-pengaturan', order: 2 },
  });

  console.log('✅ Menus created');

  // ─── Role Menus ───────────────────────────────────────────────────────────
  const allMenuIds = [
    'menu-dashboard', 'menu-master', 'menu-karyawan', 'menu-role', 'menu-menu',
    'menu-laporan', 'menu-laporan-harian', 'menu-laporan-bulanan',
    'menu-pengaturan', 'menu-profil', 'menu-password',
  ];

  // Super Admin: semua menu
  for (const menuId of allMenuIds) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: superAdmin.id, menuId } },
      update: {},
      create: { roleId: superAdmin.id, menuId },
    });
  }

  // Manager: dashboard, laporan, pengaturan
  const managerMenuIds = ['menu-dashboard', 'menu-laporan', 'menu-laporan-harian', 'menu-laporan-bulanan', 'menu-pengaturan', 'menu-profil', 'menu-password'];
  for (const menuId of managerMenuIds) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: manager.id, menuId } },
      update: {},
      create: { roleId: manager.id, menuId },
    });
  }

  // Staff: dashboard, pengaturan
  const staffMenuIds = ['menu-dashboard', 'menu-pengaturan', 'menu-profil', 'menu-password'];
  for (const menuId of staffMenuIds) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: staff.id, menuId } },
      update: {},
      create: { roleId: staff.id, menuId },
    });
  }

  console.log('✅ Role menus assigned');

  // ─── Employees ────────────────────────────────────────────────────────────
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedPass = await bcrypt.hash('pass123', 10);

  const adminUser = await prisma.employee.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedAdmin, name: 'Administrator', email: 'admin@nuha.care' },
  });

  const managerUser = await prisma.employee.upsert({
    where: { username: 'manager1' },
    update: {},
    create: { username: 'manager1', password: hashedPass, name: 'Budi Manager', email: 'manager1@nuha.care' },
  });

  const staffUser = await prisma.employee.upsert({
    where: { username: 'staff1' },
    update: {},
    create: { username: 'staff1', password: hashedPass, name: 'Siti Staff', email: 'staff1@nuha.care' },
  });

  console.log('✅ Employees created');

  // ─── Employee Roles ───────────────────────────────────────────────────────
  // admin → Super Admin
  await prisma.employeeRole.upsert({
    where: { employeeId_roleId: { employeeId: adminUser.id, roleId: superAdmin.id } },
    update: {},
    create: { employeeId: adminUser.id, roleId: superAdmin.id },
  });

  // manager1 → Manager + Staff (multi-role untuk demo)
  await prisma.employeeRole.upsert({
    where: { employeeId_roleId: { employeeId: managerUser.id, roleId: manager.id } },
    update: {},
    create: { employeeId: managerUser.id, roleId: manager.id },
  });
  await prisma.employeeRole.upsert({
    where: { employeeId_roleId: { employeeId: managerUser.id, roleId: staff.id } },
    update: {},
    create: { employeeId: managerUser.id, roleId: staff.id },
  });

  // staff1 → Staff
  await prisma.employeeRole.upsert({
    where: { employeeId_roleId: { employeeId: staffUser.id, roleId: staff.id } },
    update: {},
    create: { employeeId: staffUser.id, roleId: staff.id },
  });

  console.log('✅ Employee roles assigned');
  console.log('\n🎉 Seed complete!');
  console.log('\nTest accounts:');
  console.log('  admin    / admin123  → Super Admin');
  console.log('  manager1 / pass123   → Manager + Staff (multi-role)');
  console.log('  staff1   / pass123   → Staff');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
