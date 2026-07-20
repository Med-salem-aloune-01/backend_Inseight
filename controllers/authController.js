const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  const { nom, prenom, email, mdp } = req.body;

  try {
    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(mdp, 10);

    await User.create({ nom, prenom, email, mdp: hashedPassword });

    res.status(201).json({ message: "Inscription réussie" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, mdp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(mdp, user.mdp);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user._id, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};