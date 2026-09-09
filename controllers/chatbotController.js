const chatbotService = require('../services/chatbotService');

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message vide' });
    }

    const reply = await chatbotService.getReply(req.user, message);
    res.json({ reply });
  } catch (err) {
    console.error('❌ Erreur chatbot:', err); // ← ajoute cette ligne
    res.status(500).json({ error: 'Erreur du chatbot', details: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await chatbotService.getHistory(req.user.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération historique' });
  }
};