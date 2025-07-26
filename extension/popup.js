let mediaRecorder, audioChunks = [], accessToken = null;

document.getElementById('login').onclick = () => {
  window.open('https://ai-meeting-assistant-brhj.onrender.com/auth/google', '_blank');
  window.addEventListener('message', e => {
    if (e.data.access_token) {
      accessToken = e.data.access_token;
      document.getElementById('login').disabled = true;
      document.getElementById('start').disabled = false;
    }
  });
};

document.getElementById('start').onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const arrayBuffer = await blob.arrayBuffer();
    document.getElementById('status').innerText = 'Uploading...';
    const uploadRes = await fetch('https://ai-meeting-assistant-brhj.onrender.com/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl: URL.createObjectURL(blob), accessToken })
    });
    const { summary, docUrl } = await uploadRes.json();
    document.getElementById('summary').textContent = summary;
    document.getElementById('docLink').href = docUrl;
    document.getElementById('docLink').textContent = 'View Google Doc';
    document.getElementById('status').innerText = 'Done';
  };
  mediaRecorder.start();
  document.getElementById('start').disabled = true;
  document.getElementById('stop').disabled = false;
};

document.getElementById('stop').onclick = () => {
  mediaRecorder.stop();
  document.getElementById('start').disabled = false;
  document.getElementById('stop').disabled = true;
};
