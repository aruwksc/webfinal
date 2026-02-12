
const API = '/api';

function showTab(tab) {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab     = document.getElementById('login-tab');
  const registerTab  = document.getElementById('register-tab');

  if (tab === 'login') {
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
  } else {
    registerForm.classList.remove('d-none');
    loginForm.classList.add('d-none');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
  }
  clearAlert();
}

function showAlert(msg, type = 'danger') {
  const el = document.getElementById('authAlert');
  el.className = `alert alert-${type}`;
  el.innerHTML = `<i class="bi bi-${type === 'danger' ? 'exclamation-circle' : 'check-circle'} me-2"></i>${msg}`;
  el.classList.remove('d-none');
}

function clearAlert() {
  const el = document.getElementById('authAlert');
  el.classList.add('d-none');
}

function togglePassword(id) {
  const input = document.getElementById(id);
  const eye   = document.getElementById(id + 'Eye');
  if (input.type === 'password') {
    input.type = 'text';
    eye.className = 'bi bi-eye-slash';
  } else {
    input.type = 'password';
    eye.className = 'bi bi-eye';
  }
}

function checkPasswordStrength(val) {
  const bar   = document.getElementById('strengthBar');
  const fill  = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');

  if (!val) { bar.classList.add('d-none'); return; }
  bar.classList.remove('d-none');

  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { pct: '25%', color: '#FF6B6B', text: 'Weak' },
    { pct: '50%', color: '#FFB347', text: 'Fair' },
    { pct: '75%', color: '#56CCF2', text: 'Good' },
    { pct: '100%', color: '#2EC4B6', text: 'Strong 💪' },
  ];
  const lvl = levels[Math.max(0, score - 1)] || levels[0];
  fill.style.width = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent = lvl.text;
  label.style.color = lvl.color;
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-loader');
  btn.disabled = loading;
  text.style.display = loading ? 'none' : '';
  spinner.classList.toggle('d-none', !loading);
}

async function handleLogin(e) {
  e.preventDefault();
  clearAlert();
  setLoading('loginBtn', true);

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('hf_token', data.token);
    localStorage.setItem('hf_user', JSON.stringify(data.user));

    showAlert('Welcome back! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, 800);

  } catch (err) {
    showAlert(err.message);
  } finally {
    setLoading('loginBtn', false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  clearAlert();

  const username = document.getElementById('regUsername').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;

  if (password !== confirm) {
    showAlert('Passwords do not match'); return;
  }
  if (password.length < 6) {
    showAlert('Password must be at least 6 characters'); return;
  }

  setLoading('registerBtn', true);

  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Registration failed');

    localStorage.setItem('hf_token', data.token);
    localStorage.setItem('hf_user', JSON.stringify(data.user));

    showAlert('Account created! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, 800);

  } catch (err) {
    showAlert(err.message);
  } finally {
    setLoading('registerBtn', false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('hf_token');
  if (token) window.location.href = 'pages/dashboard.html';
});
