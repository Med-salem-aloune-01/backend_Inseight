const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("JWT_SECRET:", process.env.JWT_SECRET); // debug terminal, pas dans la réponse
    return res.status(401).json({ message: "Accès non autorisé" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.log("JWT verify error:", err.message);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = protect;