
let allHabits = [];
let todayLogs = [];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

async function loadDashboard() {
  try {
    const res = await apiFetch('/habits');
    allHabits = res.habits || [];

    renderStats();
    renderTodayHabits();
    renderWeekGrid();
    renderRecentActivity();
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

function renderStats() {
  const total     = allHabits.length;
  const todayStr  = getTodayStr();
  const completed = allHabits.filter(h => isCompletedToday(h, todayStr)).length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  const bestStreak = allHabits.reduce((m, h) => Math.max(m, h.streak || 0), 0);

  const weekDates  = getWeekDates();
  let weekDone = 0, weekTotal = 0;
  allHabits.forEach(h => {
    weekDates.forEach(d => {
      weekTotal++;
      if (isCompletedOn(h, d)) weekDone++;
    });
  });
  const weekPct = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

  setEl('streakCount', bestStreak + '🔥');
  setEl('completedToday', completed);
  setEl('totalToday', total);
  setEl('weekScore', weekPct + '%');
  setEl('totalHabits', total);

  const fill = document.getElementById('progressFill');
  const prog = document.getElementById('todayProgress');
  if (fill) fill.style.width = pct + '%';
  if (prog) prog.textContent = pct + '%';
}

function renderTodayHabits() {
  const container = document.getElementById('todayHabitsList');
  const empty     = document.getElementById('emptyToday');
  if (!container) return;

  if (!allHabits.length) {
    empty && empty.classList.remove('d-none');
    return;
  }
  empty && empty.classList.add('d-none');

  const todayStr  = getTodayStr();
  container.innerHTML = allHabits.map(habit => {
    const done    = isCompletedToday(habit, todayStr);
    const streak  = habit.streak || 0;
    const color   = habit.color || '#6C63FF';
    return `
      <div class="habit-item" onclick="toggleHabit('${habit._id}')">
        <div class="habit-check ${done ? 'done' : ''}" style="--color:${color}">
          ${done ? '<i class="bi bi-check-lg"></i>' : ''}
        </div>
        <div class="habit-info">
          <div class="habit-name ${done ? 'text-decoration-line-through text-muted' : ''}">${habit.name}</div>
          <div class="habit-meta">${getCategoryEmoji(habit.category)} ${capitalize(habit.category || '')} · ${capitalize(habit.frequency || 'daily')}</div>
        </div>
        <div class="habit-streak">${streak > 0 ? `🔥 ${streak}` : ''}</div>
      </div>`;
  }).join('');
}

function renderWeekGrid() {
  const container = document.getElementById('weekGrid');
  if (!container || !allHabits.length) { container && (container.innerHTML = '<p class="text-muted small">Add habits to see your weekly view</p>'); return; }

  const weekDates = getWeekDates();

  container.innerHTML = allHabits.slice(0, 5).map(habit => {
    const color = habit.color || '#6C63FF';
    const cells = weekDates.map(d => {
      const done = isCompletedOn(habit, d);
      return `<div class="week-cell ${done ? 'full' : ''}" style="${done ? `background:${color}` : ''}" title="${d}"></div>`;
    }).join('');
    return `
      <div class="week-row">
        <div class="week-day-label" title="${habit.name}">${habit.name.substring(0,4)}</div>
        <div class="week-cell-wrap">${cells}</div>
      </div>`;
  }).join('');
}

function renderRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;

  if (!allHabits.length) return;

  const activities = [];
  const weekDates = getWeekDates().reverse();

  allHabits.forEach(h => {
    weekDates.forEach(d => {
      if (isCompletedOn(h, d)) {
        activities.push({ name: h.name, date: d, color: h.color || '#6C63FF' });
      }
    });
  });

  activities.sort((a, b) => b.date.localeCompare(a.date));
  const recent = activities.slice(0, 6);

  if (!recent.length) {
    container.innerHTML = '<p class="text-muted text-center py-3">Start completing habits to see activity here!</p>';
    return;
  }

  container.innerHTML = recent.map(a => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${a.color}"></div>
      <div class="activity-text">Completed <strong>${a.name}</strong></div>
      <div class="activity-time">${a.date === getTodayStr() ? 'Today' : formatDate(a.date)}</div>
    </div>`).join('');
}

async function toggleHabit(habitId) {
  const habit   = allHabits.find(h => h._id === habitId);
  if (!habit) return;
  const todayStr = getTodayStr();
  const done     = isCompletedToday(habit, todayStr);

  try {
    if (!done) {
      await apiFetch(`/habits/${habitId}/checkin`, {
        method: 'POST',
        body: JSON.stringify({ date: todayStr }),
      });
      if (!habit.weeklyStatus) habit.weeklyStatus = {};
      habit.weeklyStatus[todayStr] = true;
      if (!habit.completedDates) habit.completedDates = [];
      habit.completedDates.push(todayStr);
      habit.streak = (habit.streak || 0) + 1;
    } else {
      await apiFetch(`/habits/${habitId}`, {
        method: 'PUT',
        body: JSON.stringify({ uncompleteDate: todayStr }),
      });
      if (habit.weeklyStatus) delete habit.weeklyStatus[todayStr];
      if (habit.completedDates) {
        habit.completedDates = habit.completedDates.filter(d => d !== todayStr);
      }
    }
    renderStats();
    renderTodayHabits();
    renderWeekGrid();
  } catch (err) {
    console.error('Toggle error:', err);
  }
}

async function addHabit(e) {
  e.preventDefault();
  const name      = document.getElementById('habitName').value.trim();
  const desc      = document.getElementById('habitDesc').value.trim();
  const category  = document.getElementById('habitCategory').value;
  const frequency = document.getElementById('habitFrequency').value;
  const color     = document.querySelector('input[name="habitColor"]:checked')?.value || '#6C63FF';

  try {
    const res = await apiFetch('/habits', {
      method: 'POST',
      body: JSON.stringify({ name, description: desc, category, frequency, color }),
    });
    allHabits.push(res.habit || res);
    bootstrap.Modal.getInstance(document.getElementById('addHabitModal'))?.hide();
    document.getElementById('addHabitForm').reset();
    renderStats();
    renderTodayHabits();
    renderWeekGrid();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function isCompletedToday(habit, todayStr) {
  if (habit.weeklyStatus && habit.weeklyStatus[todayStr]) return true;
  if (habit.completedDates && habit.completedDates.includes(todayStr)) return true;
  return false;
}

function isCompletedOn(habit, dateStr) {
  if (habit.weeklyStatus && habit.weeklyStatus[dateStr]) return true;
  if (habit.completedDates && habit.completedDates.includes(dateStr)) return true;
  return false;
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

document.addEventListener('DOMContentLoaded', loadDashboard);
