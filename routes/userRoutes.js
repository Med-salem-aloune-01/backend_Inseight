const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const protect = require("../middlewares/authMiddleware");  // vérifie le nom du dossier
const authorize = require("../middlewares/roleMiddleware");
router.get('/me', protect, userController.getMe);
router.put('/me', protect, userController.updateMe); 
router.post("/ajouter", userController.ajouterUtilisateur);
router.get(
  '/students/mylists',
  protect,
  authorize(['teacher', 'admin']),
  userController.listStudentsteach
);
router.get("/list" ,protect,authorize(["admin"]),userController.listerUtilisateurs);
router.get("/students/lists", protect, authorize(["admin","teacher"]),userController.listerEtudiants);
router.get("/:id", userController.getUtilisateurById);
router.put("/:id", userController.updateUtilisateur);
router.delete("/:id", userController.deleteUtilisateur);



module.exports = router;

