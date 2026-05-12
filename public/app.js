// ─── API Client ───────────────────────────────────────────────────────────────
const API = window.location.origin + '/api';

async function request(method, path, body = null, useToken = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (useToken) {
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API + path, opts);
  const json = await res.json();

  if (res.status === 401) {
    // Try refresh
    const refreshed = await tryRefresh();
    if (refreshed) return request(method, path, body, useToken);
    logout();
    return null;
  }
  return { ok: res.ok, status: res.status, data: json };
}

async function tryRefresh() {
  const rt = localStorage.getItem('refresh_token');
  if (!rt) return false;
  try {
    const res = await fetch(API + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    localStorage.setItem('access_token', json.data.access_token);
    localStorage.setItem('refresh_token', json.data.refresh_token);
    return true;
  } catch { return false; }
}

const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  put:    (path, body)   => request('PUT',    path, body),
  delete: (path)         => request('DELETE', path),
  postPublic: (path, body) => request('POST', path, body, false),
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function getEmployee()   { try { return JSON.parse(localStorage.getItem('employee') || '{}'); } catch { return {}; } }
function getActiveRole() { try { return JSON.parse(localStorage.getItem('active_role') || '{}'); } catch { return {}; } }
function isLoggedIn()    { return !!localStorage.getItem('access_token'); }

function logout() {
  api.post('/auth/logout').finally(() => {
    localStorage.clear();
    window.location.href = '/';
  });
}

function requireAuth() {
  if (!isLoggedIn()) { window.location.href = '/'; return false; }
  return true;
}

// ─── Toast notification ───────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const colors = {
    success: 'bg-green-500',
    error:   'bg-red-500',
    info:    'bg-blue-500',
    warn:    'bg-yellow-500',
  };
  const el = document.createElement('div');
  el.className = `fixed bottom-4 right-4 z-50 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all ${colors[type] || colors.info}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
}

// ─── Modal helper ─────────────────────────────────────────────────────────────
function showModal(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function confirm(msg) {
  return new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    el.innerHTML = `
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <p class="text-gray-800 font-medium mb-5">${msg}</p>
        <div class="flex gap-3 justify-end">
          <button id="cfNo"  class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
          <button id="cfYes" class="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg">Hapus</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    el.querySelector('#cfYes').onclick = () => { el.remove(); resolve(true); };
    el.querySelector('#cfNo').onclick  = () => { el.remove(); resolve(false); };
  });
}

// ─── Sidebar renderer ─────────────────────────────────────────────────────────
async function renderSidebar(activeMenu = '') {
  const emp  = getEmployee();
  const role = getActiveRole();

  // Set user info
  document.getElementById('sidebarName')?.textContent && (document.getElementById('sidebarName').textContent = emp.name || 'User');
  document.getElementById('sidebarRole')?.textContent && (document.getElementById('sidebarRole').textContent = role.name || '');

  const res = await api.get('/me/menus');
  if (!res?.ok) return;

  const container = document.getElementById('sidebarMenus');
  if (!container) return;
  container.innerHTML = '';
  renderMenuItems(res.data.data, container, activeMenu, 0);
}

function renderMenuItems(menus, container, activeMenu, level) {
  menus.forEach(m => {
    const isActive = activeMenu === m.path;
    const hasChildren = m.children && m.children.length > 0;
    const indent = level * 12;

    const item = document.createElement('div');
    item.innerHTML = `
      <a href="${m.path || '#'}"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer
          ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
        style="padding-left: ${12 + indent}px">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="${hasChildren ? 'M3 7h18M3 12h18M3 17h18' : 'M9 5l7 7-7 7'}"/>
        </svg>
        <span>${m.name}</span>
      </a>`;
    container.appendChild(item);

    if (hasChildren) {
      const sub = document.createElement('div');
      sub.className = 'ml-2';
      container.appendChild(sub);
      renderMenuItems(m.children, sub, activeMenu, level + 1);
    }
  });
}
