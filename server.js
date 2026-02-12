require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 HabitFlow running on http://localhost:${PORT}`);
});
