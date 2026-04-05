const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Phục vụ file tĩnh (ảnh upload)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/places', require('./routes/place'));
app.use('/api/tours', require('./routes/tour'));
app.use('/api/foods', require('./routes/food'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/contacts', require('./routes/contact'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));  // MỚI
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '🏖️ DANATrip API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      places: '/api/places',
      tours: '/api/tours',
      foods: '/api/foods',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      contacts: '/api/contacts',
      chat: '/api/chat',
      upload: '/api/upload',
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV}\n`);
});