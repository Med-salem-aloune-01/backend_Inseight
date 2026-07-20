const Cour = require("../models/Cours");
// Ajouter un utilisateur (admin uniquement)
exports.ajouterCour = async (req, res) => {
try { const { titre, description, niveau, categorie } = req.body;
const nouvelCour = new Cour({
titre,
description,
niveau,
categorie,
image: req.file ? req.file.filename : null
});
await nouvelCour.save();
res.status(201).json(nouvelCour);
} catch (err) {
res.status(400).json({ message: "Erreur d’ajout", error: err.message });
}
};
// Récupérer tous les utilisateurs
exports.listerCour = async (req, res) => {
try {
const cours = await Cour.find();
res.json(cours);
} catch (err) {
res.status(500).json({ error: err.message });
}
};

