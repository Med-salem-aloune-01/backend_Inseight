const authorize = (roles = []) => {
  return (req, res, next) => {
    console.log("REQ.USER:", req.user);
    console.log("USER ROLE:", req.user?.role);
    console.log("ALLOWED ROLES:", roles);

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Accès refusé",
        userRole: req.user.role,
        allowedRoles: roles
      });
    }

    next();
  };
};

module.exports = authorize;