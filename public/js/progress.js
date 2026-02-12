
let allHabits = [];
let period    = 30;
let weeklyChart, categoryChart;

async function loadProgress() {
  try {
    const res = await apiFetch('/habits');
    allHabits = res.habits || [];
    renderSummaryStats();
    renderWeeklyChart();
    renderCategoryChart();
    renderPerformanceTable();
    renderAnnualHeatmap();
    populateHeatmapSelect();
  } catch (err) {
    console.error('Progress error:', err);
  }
}

function changePeriod(val) {
  period = parseInt(val);
  renderSummaryStats();
  renderWeeklyChart();
  renderPerformanceTable();
}

function renderSummaryStats() {
  const dates = getLastNDates(period);
  let totalPossible = 0, totalDone = 0, perfectDays = 0;

  dates.forEach(d => {
    const done = allHabits.filter(h => isCompletedOn(h, d)).length;
    const total = allHabits.length;
    if (total > 0) {
      totalPossible += total;
      totalDone += done;
      if (done === total) perfectDays++;
    }
  });

  const rate    = totalPossible ? Math.round((totalDone / totalPossible) * 100) : 0;
  const best    = allHabits.reduce((m, h) => Math.max(m, h.streak || 0), 0);

  setEl('bestStreak',     best + ' 🔥');
  setEl('completionRate', rate + '%');
  setEl('perfectDays',    perfectDays);
  setEl('totalCheckins',  totalDone);
}

function renderWeeklyChart() {
  const canvas = document.getElementById('weeklyChart');
  if (!canvas) return;

  const dates = getLastNDates(Math.min(period, 14)).reverse();
  const labels = dates.map(d => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const data = dates.map(d =>
    allHabits.filter(h => isCompletedOn(h, d)).length
  );

  const possible = allHabits.length || 1;
  const pcts = data.map(v => Math.round((v / possible) * 100));

  if (weeklyChart) weeklyChart.destroy();
  weeklyChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data: pcts,
        backgroundColor: pcts.map(p =>
          p >= 80 ? 'rgba(46,196,182,0.7)' : p >= 50 ? 'rgba(124,111,247,0.7)' : 'rgba(255,107,107,0.5)'
        ),
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw}% completed`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#8B90A8', font: { size: 11 } },
        },
        y: {
          min: 0, max: 100,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#8B90A8', font: { size: 11 }, callback: v => v + '%' },
        }
      }
    }
  });
}

function renderCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;

  const CATS = { health: '💪 Health', mind: '🧠 Mind', work: '💼 Work', social: '👥 Social', creative: '🎨 Creative', finance: '💰 Finance' };
  const COLORS = ['#6C63FF', '#2EC4B6', '#FF6B6B', '#FFB347', '#56CCF2', '#A8E063'];

  const counts = Object.keys(CATS).map(c => allHabits.filter(h => h.category === c).length);
  const nonZero = counts.some(c => c > 0);

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: Object.values(CATS),
      datasets: [{
        data: nonZero ? counts : [1, 1, 1, 1, 1, 1],
        backgroundColor: COLORS,
        borderColor: '#141720',
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8B90A8', font: { size: 10 }, boxWidth: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${nonZero ? ctx.raw : 0} habits`
          }
        }
      }
    }
  });
}

function renderPerformanceTable() {
  const tbody = document.getElementById('performanceBody');
  if (!tbody) return;

  if (!allHabits.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No habits to display</td></tr>';
    return;
  }

  const dates = getLastNDates(period);
  tbody.innerHTML = allHabits.map(h => {
    const done  = dates.filter(d => isCompletedOn(h, d)).length;
    const rate  = Math.round((done / dates.length) * 100);
    const streak = h.streak || 0;
    const color  = h.color || '#6C63FF';

    let statusClass = 'status-needs', statusLabel = 'Needs work';
    if (rate >= 80) { statusClass = 'status-great'; statusLabel = 'Great! 🏆'; }
    else if (rate >= 50) { statusClass = 'status-good'; statusLabel = 'Good 👍'; }

    return `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
            <strong>${h.name}</strong>
          </div>
        </td>
        <td>${getCategoryEmoji(h.category)} ${capitalize(h.category || '')}</td>
        <td>🔥 ${streak} days</td>
        <td>
          <div class="perf-bar">
            <div class="perf-bar-track">
              <div class="perf-bar-fill" style="width:${rate}%;background:${color}"></div>
            </div>
            <small class="text-muted ms-2">${rate}%</small>
          </div>
        </td>
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      </tr>`;
  }).join('');
}

function populateHeatmapSelect() {
  const select = document.getElementById('heatmapHabit');
  if (!select) return;
  select.innerHTML = '<option value="all">All Habits</option>' +
    allHabits.map(h => `<option value="${h._id}">${h.name}</option>`).join('');
}

function updateHeatmap() {
  renderAnnualHeatmap();
}

function renderAnnualHeatmap() {
  const container = document.getElementById('annualHeatmap');
  if (!container) return;

  const habitId = document.getElementById('heatmapHabit')?.value || 'all';
  const habits  = habitId === 'all' ? allHabits : allHabits.filter(h => h._id === habitId);

  const today  = new Date();
  const start  = new Date(today);
  start.setFullYear(today.getFullYear() - 1);
  start.setDate(start.getDate() - start.getDay()); // align to Sunday

  const weeks = [];
  let cur = new Date(start);
  while (cur <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cur.toISOString().split('T')[0];
      const total   = habits.length;
      const done    = habits.filter(h => isCompletedOn(h, dateStr)).length;
      const level   = total === 0 ? 0 : done === 0 ? 0 : done < total * 0.33 ? 1 : done < total * 0.66 ? 2 : done < total ? 3 : 4;
      week.push({ dateStr, level });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  container.innerHTML = weeks.map(week =>
    `<div class="hm-week-col">${week.map(cell => `
      <div class="hm-cell" 
           style="background:var(--hm-${cell.level})"
           title="${cell.dateStr}"
      ></div>`).join('')}
    </div>`
  ).join('');
}

function getLastNDates(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().split('T')[0];
  });
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

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

document.addEventListener('DOMContentLoaded', loadProgress);
