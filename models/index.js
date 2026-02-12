const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
  habit:   { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  date:    { type: String, required: true }, 
  note:    { type: String, default: '' },
  mood:    { type: Number, min: 1, max: 5 },
}, { timestamps: true });

LogSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Log', LogSchema);


const CategorySchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true },
  emoji:    { type: String, default: '⭐' },
  color:    { type: String, default: '#6C63FF' },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

mongoose.model('Category', CategorySchema);


const AchievementSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key:         { type: String, required: true },
  label:       { type: String },
  icon:        { type: String },
  unlockedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

AchievementSchema.index({ user: 1, key: 1 }, { unique: true });
mongoose.model('Achievement', AchievementSchema);


module.exports = {
  Log:         mongoose.model('Log'),
  Category:    mongoose.model('Category'),
  Achievement: mongoose.model('Achievement'),
};
