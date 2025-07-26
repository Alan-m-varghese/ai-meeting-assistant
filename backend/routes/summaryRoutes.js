const express = require('express');
const { transcribeAudioFromURL } = require('../utils/transcribe');
const { summarizeTextWithGPT } = require('../utils/gpt');
const { createGoogleDoc } = require('../googleAuth');
const router = express.Router();

router.post('/', async (req, res) => {
  const { audioUrl, accessToken } = req.body;
  try {
    const transcript = await transcribeAudioFromURL(audioUrl);
    const summary = await summarizeTextWithGPT(transcript);
    const docUrl = await createGoogleDoc(summary, accessToken);
    res.json({ transcript, summary, docUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Processing error' });
  }
});

module.exports = router;
