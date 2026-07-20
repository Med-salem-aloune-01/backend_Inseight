const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const protect = require("../middlewares/authMiddleware");  // vérifie le nom du dossier
const authorize = require("../middlewares/roleMiddleware");


router.post("/ajouter", userController.ajouterUtilisateur);
router.get("/list", protect,authorize(["user"]) ,userController.listerUtilisateurs);
router.get("/:id", userController.getUtilisateurById);
router.put("/:id", userController.updateUtilisateur);
router.delete("/:id", userController.deleteUtilisateur);


module.exports = router;

