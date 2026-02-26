
const express = require('express');
const router = express.Router();

// Mock users database
const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'doctor1', password: 'doctor123', role: 'doctor' },
  { username: 'user1', password: 'user123', role: 'patient' }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        fullName: user.username.charAt(0).toUpperCase() + user.username.slice(1)
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

module.exports = router;
