const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email:     { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 },
  firstName: { type: String, trim: true, default: '' },
  lastName:  { type: String, trim: true, default: '' },
  bio:       { type: String, default: '' },
  avatar:    { type: String, default: '' },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  preferences: {
    reminderTime:  { type: String, default: '08:00' },
    weekStart:     { type: Number, default: 1 }, 
    notifications: { type: Boolean, default: true },
    summaryEmail:  { type: Boolean, default: false },
  },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
