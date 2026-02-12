
const API = '/api';

function requireAuth() {
  const token = localStorage.getItem('hf_token');
  if (!token) {
    window.location.href = '/index.html';
    return null;
  }
  return token;
}

function getUser() {
  const u = localStorage.getItem('hf_user');
  return u ? JSON.parse(u) : null;
}

function getToken() {
  return localStorage.getItem('hf_token');
}

function logout() {
  localStorage.removeItem('hf_token');
  localStorage.removeItem('hf_user');
  window.location.href = '/index.html';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) { logout(); return null; }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function togglePassword(id) {
  const input = document.getElementById(id);
  const eye   = document.getElementById(id + 'Eye');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (eye) eye.className = 'bi bi-eye-slash';
  } else {
    input.type = 'password';
    if (eye) eye.className = 'bi bi-eye';
  }
}

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(d) {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function getCategoryEmoji(cat) {
  const map = {
    health: '💪', mind: '🧠', work: '💼',
    social: '👥', creative: '🎨', finance: '💰',
  };
  return map[cat] || '⭐';
}

function showAlert(elId, msg, type = 'danger') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.innerHTML = `<i class="bi bi-${type === 'danger' ? 'exclamation-circle' : 'check-circle'} me-2"></i>${msg}`;
  el.classList.remove('d-none');
  if (type === 'success') {
    setTimeout(() => el.classList.add('d-none'), 3000);
  }
}

function hideAlert(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.add('d-none');
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getWeekDates() {
  const today = new Date();
  const day = today.getDay(); 
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  const greetEl = document.getElementById('greeting');
  if (greetEl) {
    const h = new Date().getHours();
    greetEl.textContent = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }

  const dateEl = document.getElementById('todayDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  }

  const welcomeEl = document.getElementById('welcomeUser');
  if (welcomeEl) {
    const user = getUser();
    welcomeEl.textContent = user ? `Welcome back, ${user.username}! Keep going.` : '';
  }
});
