const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ✅ Chỉ require ROUTE files - KHÔNG require controller ở đây
app.use('/api/auth', require('./routes/auth'));
app.use('/api/places', require('./routes/place'));
app.use('/api/tours', require('./routes/tour'));
app.use('/api/foods', require('./routes/food'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/contacts', require('./routes/contact'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '🏖️ DANATrip API is running!',
    version: '1.0.0',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
});