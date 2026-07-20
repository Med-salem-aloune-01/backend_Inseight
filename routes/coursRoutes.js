const express = require("express");
const router = express.Router();
const coursController = require("../controllers/coursController");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const protect = require("../middlewares/authMiddleware");  // vérifie le nom du dossier
const authorize = require("../middlewares/roleMiddleware");



router.post('/ajouter', upload.single('image'), coursController.ajouterCour);
router.get("/list", coursController.listerCour);


module.exports = router;