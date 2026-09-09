const express = require("express");
const router = express.Router();

const { register, login ,logout, updateProfile, changePassword } = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);
router.get("/list", (req, res) => {
  res.json({ message: "Profil utilisateur", user: req.user });
});

module.exports = router;