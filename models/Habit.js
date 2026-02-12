const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, default: '' },
  category:    { type: String, enum: ['health','mind','work','social','creative','finance'], default: 'health' },
  frequency:   { type: String, enum: ['daily','weekly','weekdays','weekends'], default: 'daily' },
  target:      { type: Number, default: 1, min: 1 },
  color:       { type: String, default: '#6C63FF' },
  reminder:    { type: String, default: '08:00' },
  isActive:    { type: Boolean, default: true },

  streak:         { type: Number, default: 0 },
  longestStreak:  { type: Number, default: 0 },
  completedDates: [{ type: String }],       
  weeklyStatus:   { type: Map, of: Boolean, default: {} },
  completionRate: { type: Number, default: 0 }, 
}, { timestamps: true });

HabitSchema.methods.recalcStreak = function () {
  const dates = [...this.completedDates].sort();
  if (!dates.length) { this.streak = 0; return; }

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let check   = new Date(today);

  while (true) {
    const d = check.toISOString().split('T')[0];
    if (dates.includes(d)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else break;
  }

  this.streak = streak;
  if (streak > this.longestStreak) this.longestStreak = streak;
};

module.exports = mongoose.model('Habit', HabitSchema);
