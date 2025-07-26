const axios = require('axios');
const ASSEMBLY_API_KEY = process.env.ASSEMBLYAI_API_KEY;

async function transcribeAudioFromURL(audioUrl) {
  const headers = { authorization: ASSEMBLY_API_KEY, 'content-type': 'application/json' };
  const resp = await axios.post('https://api.assemblyai.com/v2/transcript',
    { audio_url: audioUrl, speaker_labels: true },
    { headers }
  );
  const transcriptId = resp.data.id;
  while (true) {
    const poll = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, { headers });
    if (poll.data.status === 'completed') return poll.data.text;
    if (poll.data.status === 'error') throw new Error('Transcription failed');
    await new Promise(r => setTimeout(r, 3000));
  }
}

module.exports = { transcribeAudioFromURL };
