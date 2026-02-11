const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../model/User');

// Login – returns JWT
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: create initial admin (run once)
router.post('/setup', async (req, res) => {
  try {
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
      const admin = new User({ username: 'admin', password: 'yourpassword' });
      await admin.save();
      res.json({ message: 'Admin created' });
    } else {
      res.json({ message: 'Admin already exists' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;