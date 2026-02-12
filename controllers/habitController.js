const Habit = require('../models/Habit');
const Log   = require('../models/index').Log;

const createHabit = async (req, res, next) => {
  try {
    const { name, description, category, frequency, target, color, reminder } = req.body;
    const habit = await Habit.create({
      user: req.user._id,
      name, description, category, frequency, target, color, reminder,
    });
    res.status(201).json({ habit, message: 'Habit created' });
  } catch (err) { next(err); }
};

const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true })
      .sort({ createdAt: -1 });

    const enriched = habits.map(h => {
      const obj = h.toObject();
      const total = h.completedDates.length;
      const daysAlive = Math.max(1, Math.floor((Date.now() - new Date(h.createdAt)) / 86400000));
      obj.completionRate = Math.min(100, Math.round((total / daysAlive) * 100));
      return obj;
    });

    res.json({ habits: enriched, total: enriched.length });
  } catch (err) { next(err); }
};

const getHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ habit });
  } catch (err) { next(err); }
};

const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const { name, description, category, frequency, target, color, reminder, uncompleteDate } = req.body;

    if (name        !== undefined) habit.name        = name;
    if (description !== undefined) habit.description = description;
    if (category    !== undefined) habit.category    = category;
    if (frequency   !== undefined) habit.frequency   = frequency;
    if (target      !== undefined) habit.target      = target;
    if (color       !== undefined) habit.color       = color;
    if (reminder    !== undefined) habit.reminder    = reminder;

    if (uncompleteDate) {
      habit.completedDates = habit.completedDates.filter(d => d !== uncompleteDate);
      if (habit.weeklyStatus) habit.weeklyStatus.delete(uncompleteDate);
      habit.recalcStreak();
    }

    await habit.save();
    res.json({ habit, message: 'Habit updated' });
  } catch (err) { next(err); }
};

const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    if (req.user.role === 'admin') {
      await Habit.findByIdAndDelete(req.params.id);
    } else {
      habit.isActive = false;
      await habit.save();
    }

    res.json({ message: 'Habit deleted' });
  } catch (err) { next(err); }
};

const checkinHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const date = req.body.date || new Date().toISOString().split('T')[0];

    if (habit.completedDates.includes(date)) {
      return res.status(400).json({ message: 'Already checked in for this date' });
    }

    habit.completedDates.push(date);
    habit.weeklyStatus.set(date, true);
    habit.recalcStreak();

    await Log.findOneAndUpdate(
      { user: req.user._id, habit: habit._id, date },
      { user: req.user._id, habit: habit._id, date, note: req.body.note || '' },
      { upsert: true, new: true }
    );

    await habit.save();
    res.json({ habit, message: 'Checked in!' });
  } catch (err) { next(err); }
};

module.exports = { createHabit, getHabits, getHabit, updateHabit, deleteHabit, checkinHabit };
