
let allHabits    = [];
let currentCategory = 'all';
let currentView     = 'grid';
let deleteTargetId  = null;

async function loadHabits() {
  try {
    const res = await apiFetch('/habits');
    allHabits = res.habits || [];
    renderHabits();
  } catch (err) {
    showAlert('pageAlert', 'Failed to load habits: ' + err.message);
  }
}

function renderHabits() {
  const search = (document.getElementById('searchHabits')?.value || '').toLowerCase();
  let habits = allHabits.filter(h => {
    const matchCat  = currentCategory === 'all' || h.category === currentCategory;
    const matchSearch = !search || h.name.toLowerCase().includes(search) || (h.description || '').toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  const container = document.getElementById('habitsContainer');
  const empty     = document.getElementById('emptyHabits');
  if (!container) return;

  if (!habits.length) {
    container.innerHTML = '';
    empty?.classList.remove('d-none');
    return;
  }
  empty?.classList.add('d-none');

  container.className = currentView === 'grid' ? 'habits-grid' : 'habits-list';
  container.innerHTML = habits.map(h => renderHabitCard(h)).join('');
}

function renderHabitCard(h) {
  const color   = h.color || '#6C63FF';
  const streak  = h.streak || 0;
  const rate    = h.completionRate || 0;
  const todayStr = getTodayStr();
  const doneDates = h.completedDates || [];

  const week = getWeekDates().map(d => {
    const done = doneDates.includes(d) || (h.weeklyStatus && h.weeklyStatus[d]);
    return `<div class="hw-dot ${done ? 'done' : ''}" style="${done ? `background:${color}` : ''}" title="${d}"></div>`;
  }).join('');

  const doneToday = doneDates.includes(todayStr) || (h.weeklyStatus && h.weeklyStatus[todayStr]);

  return `
    <div class="habit-card" style="--hc:${color}" data-id="${h._id}" data-category="${h.category}">
      <div class="habit-card-header">
        <div>
          <div class="habit-card-title">${h.name}</div>
          <div class="habit-card-cat">${getCategoryEmoji(h.category)} ${capitalize(h.category || 'general')} · ${capitalize(h.frequency || 'daily')}</div>
        </div>
        <div class="habit-card-actions">
          <button class="habit-action-btn" onclick="editHabit('${h._id}')" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="habit-action-btn delete" onclick="openDelete('${h._id}')" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>

      ${h.description ? `<p class="text-muted small mb-2" style="line-height:1.4">${h.description}</p>` : ''}

      <div class="habit-card-stats">
        <div class="habit-card-stat">🔥 <strong>${streak}</strong> streak</div>
        <div class="habit-card-stat">📊 <strong>${rate}%</strong> rate</div>
        <div class="habit-card-stat ${doneToday ? 'text-success' : ''}">
          ${doneToday ? '✅ Done today' : '⭕ Pending'}
        </div>
      </div>

      <div class="habit-weekly">${week}</div>
    </div>`;
}

function filterHabits() { renderHabits(); }

function filterByCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHabits();
}

function setView(v) {
  currentView = v;
  document.getElementById('gridViewBtn').classList.toggle('active', v === 'grid');
  document.getElementById('listViewBtn').classList.toggle('active', v === 'list');
  renderHabits();
}

async function saveHabit(e) {
  e.preventDefault();
  const editId    = document.getElementById('editHabitId').value;
  const name      = document.getElementById('hName').value.trim();
  const desc      = document.getElementById('hDesc').value.trim();
  const category  = document.getElementById('hCategory').value;
  const frequency = document.getElementById('hFrequency').value;
  const target    = parseInt(document.getElementById('hTarget').value) || 1;
  const reminder  = document.getElementById('hReminder').value;
  const color     = document.querySelector('input[name="hColor"]:checked')?.value || '#6C63FF';

  const payload = { name, description: desc, category, frequency, target, reminder, color };

  try {
    if (editId) {
    
      const res = await apiFetch(`/habits/${editId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const idx = allHabits.findIndex(h => h._id === editId);
      if (idx !== -1) allHabits[idx] = { ...allHabits[idx], ...payload };
    } else {
      const res = await apiFetch('/habits', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      allHabits.push(res.habit || res);
    }

    bootstrap.Modal.getInstance(document.getElementById('habitModal'))?.hide();
    resetHabitForm();
    renderHabits();
    showAlert('pageAlert', editId ? 'Habit updated!' : 'Habit created!', 'success');

  } catch (err) {
    showAlert('pageAlert', 'Error: ' + err.message);
  }
}

function editHabit(id) {
  const h = allHabits.find(h => h._id === id);
  if (!h) return;

  document.getElementById('editHabitId').value  = id;
  document.getElementById('hName').value         = h.name;
  document.getElementById('hDesc').value         = h.description || '';
  document.getElementById('hCategory').value     = h.category || 'health';
  document.getElementById('hFrequency').value    = h.frequency || 'daily';
  document.getElementById('hTarget').value       = h.target || 1;
  document.getElementById('hReminder').value     = h.reminder || '08:00';

  const colorRadio = document.querySelector(`input[name="hColor"][value="${h.color}"]`);
  if (colorRadio) colorRadio.checked = true;

  document.getElementById('habitModalTitle').innerHTML =
    '<i class="bi bi-pencil me-2 text-accent"></i>Edit Habit';

  const modal = new bootstrap.Modal(document.getElementById('habitModal'));
  modal.show();
}

function openDelete(id) {
  deleteTargetId = id;
  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  try {
    await apiFetch(`/habits/${deleteTargetId}`, { method: 'DELETE' });
    allHabits = allHabits.filter(h => h._id !== deleteTargetId);
    bootstrap.Modal.getInstance(document.getElementById('deleteModal'))?.hide();
    renderHabits();
    showAlert('pageAlert', 'Habit deleted.', 'success');
  } catch (err) {
    showAlert('pageAlert', 'Error: ' + err.message);
  } finally {
    deleteTargetId = null;
  }
}

function resetHabitForm() {
  document.getElementById('habitForm').reset();
  document.getElementById('editHabitId').value = '';
  document.getElementById('habitModalTitle').innerHTML =
    '<i class="bi bi-plus-circle me-2 text-accent"></i>New Habit';
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

document.addEventListener('DOMContentLoaded', () => {
  loadHabits();
  const modalEl = document.getElementById('habitModal');
  if (modalEl) modalEl.addEventListener('hidden.bs.modal', resetHabitForm);
});
