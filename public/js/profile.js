
const ACHIEVEMENTS = [
  { icon: '🌱', label: 'First Habit',   key: 'first_habit',   req: h => h.length >= 1 },
  { icon: '🔥', label: '7-Day Streak',  key: 'streak_7',      req: h => h.some(x => (x.streak||0) >= 7) },
  { icon: '⚡', label: '30-Day Streak', key: 'streak_30',     req: h => h.some(x => (x.streak||0) >= 30) },
  { icon: '🏆', label: '5 Habits',      key: 'five_habits',   req: h => h.length >= 5 },
  { icon: '💯', label: 'Perfect Week',  key: 'perfect_week',  req: () => false },
  { icon: '🌟', label: '100 Days',      key: 'days_100',      req: () => false },
  { icon: '💎', label: 'Master',        key: 'master',        req: h => h.some(x => (x.streak||0) >= 100) },
  { icon: '🎯', label: 'On Target',     key: 'on_target',     req: h => h.some(x => (x.completionRate||0) >= 90) },
];

let currentUser = null;
let allHabits   = [];

async function loadProfile() {
  try {
    const [userRes, habitsRes] = await Promise.all([
      apiFetch('/users/profile'),
      apiFetch('/habits'),
    ]);
    currentUser = userRes.user || userRes;
    allHabits   = (habitsRes.habits || []);
    renderProfile();
    renderAchievements();
  } catch (err) {
    showAlert('profileAlert', 'Error loading profile: ' + err.message);
  }
}

function renderProfile() {
  if (!currentUser) return;

  const initials = ((currentUser.username || '?').charAt(0)).toUpperCase();
  setEl('avatarInitials', initials);
  setEl('profileDisplayName', currentUser.username || '—');
  setEl('profileDisplayEmail', currentUser.email || '—');

  const roleBadge = document.getElementById('profileRole');
  if (roleBadge) {
    roleBadge.textContent = currentUser.role || 'user';
    roleBadge.style.background = currentUser.role === 'admin' ? 'rgba(255,159,71,0.15)' : 'rgba(124,111,247,0.15)';
    roleBadge.style.color = currentUser.role === 'admin' ? '#FFB347' : 'var(--accent)';
  }

  setVal('editUsername', currentUser.username || '');
  setVal('editEmail',    currentUser.email    || '');
  setVal('editFirstName', currentUser.firstName || '');
  setVal('editLastName',  currentUser.lastName  || '');
  setVal('editBio',       currentUser.bio       || '');

  const streak = allHabits.reduce((m, h) => Math.max(m, h.streak || 0), 0);
  const daysActive = currentUser.createdAt
    ? Math.floor((Date.now() - new Date(currentUser.createdAt)) / 86400000)
    : 0;
  setEl('psHabits', allHabits.length);
  setEl('psStreak', streak + '🔥');
  setEl('psDays',   daysActive);

  const savedAvatar = localStorage.getItem('hf_avatar');
  if (savedAvatar) {
    const circle = document.getElementById('avatarDisplay');
    circle.innerHTML = `<img src="${savedAvatar}" alt="Avatar"/>`;
  }
}

function renderAchievements() {
  const container = document.getElementById('achievementsList');
  if (!container) return;

  container.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = a.req(allHabits);
    return `
      <div class="achievement ${unlocked ? '' : 'locked'}" title="${a.label}${unlocked ? ' ✓' : ' (locked)'}">
        ${a.icon}
      </div>`;
  }).join('');
}

async function updateProfile(e) {
  e.preventDefault();
  hideAlert('profileAlert');

  const payload = {
    username:  document.getElementById('editUsername').value.trim(),
    email:     document.getElementById('editEmail').value.trim(),
    firstName: document.getElementById('editFirstName').value.trim(),
    lastName:  document.getElementById('editLastName').value.trim(),
    bio:       document.getElementById('editBio').value.trim(),
  };

  try {
    const res = await apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    currentUser = { ...currentUser, ...payload };
    localStorage.setItem('hf_user', JSON.stringify(currentUser));
    renderProfile();
    showAlert('profileAlert', 'Profile updated successfully!', 'success');
  } catch (err) {
    showAlert('profileAlert', 'Error: ' + err.message);
  }
}

async function changePassword(e) {
  e.preventDefault();
  const currentPass = document.getElementById('currentPass').value;
  const newPass     = document.getElementById('newPass').value;
  const confirmNew  = document.getElementById('confirmNewPass').value;

  if (newPass !== confirmNew) {
    showAlert('profileAlert', 'New passwords do not match'); return;
  }
  if (newPass.length < 6) {
    showAlert('profileAlert', 'Password must be at least 6 characters'); return;
  }

  try {
    await apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
    });
    document.getElementById('passwordForm').reset();
    showAlert('profileAlert', 'Password changed successfully!', 'success');
  } catch (err) {
    showAlert('profileAlert', 'Error: ' + err.message);
  }
}

function savePreferences() {
  const prefs = {
    reminderTime: document.getElementById('reminderTime').value,
    weekStart:    document.getElementById('weekStart').value,
    notifications: document.getElementById('notifToggle').checked,
    summaryEmail:  document.getElementById('summaryToggle').checked,
  };
  localStorage.setItem('hf_prefs', JSON.stringify(prefs));
  showAlert('profileAlert', 'Preferences saved!', 'success');
}

function loadPreferences() {
  const prefs = JSON.parse(localStorage.getItem('hf_prefs') || '{}');
  if (prefs.reminderTime) setVal('reminderTime', prefs.reminderTime);
  if (prefs.weekStart)    setVal('weekStart',    prefs.weekStart);
  if (prefs.notifications !== undefined) document.getElementById('notifToggle').checked = prefs.notifications;
  if (prefs.summaryEmail !== undefined)  document.getElementById('summaryToggle').checked  = prefs.summaryEmail;
}

async function deleteAccount() {
  const confirm = document.getElementById('deleteConfirmInput').value;
  if (confirm !== 'DELETE') {
    alert('Please type DELETE to confirm'); return;
  }

  try {
    await apiFetch('/users/profile', { method: 'DELETE' });
    localStorage.clear();
    window.location.href = '/index.html';
  } catch (err) {
    showAlert('profileAlert', 'Error deleting account: ' + err.message);
    bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'))?.hide();
  }
}

function updateAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    localStorage.setItem('hf_avatar', dataUrl);
    const circle = document.getElementById('avatarDisplay');
    circle.innerHTML = `<img src="${dataUrl}" alt="Avatar"/>`;
  };
  reader.readAsDataURL(file);
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadPreferences();
});
