
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', doctorRoutes);

app.get('/', (req, res) => {
  res.send('HealthCore Pro API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
