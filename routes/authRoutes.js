const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/list", protect, authorize(["parent", "admin"]), (req, res) => {
  res.json({ message: "Profil utilisateur", user: req.user });
});

router.get("/admin", protect, authorize(["admin"]), (req, res) => {
  res.json({ message: "Espace administrateur" });
});
// dans authRoutes.js
router.get("/me", protect, (req, res) => {
  res.json({ message: "Token décodé", user: req.user });
});
module.exports = router;