let mediaRecorder, audioChunks = [], accessToken = null;

document.getElementById('login').onclick = () => {
  const authWindow = window.open(
    'https://ai-meeting-assistant-brhj.onrender.com/auth/google',
    '_blank',
    'width=500,height=600'
  );

  // Listen for tokens from popup window
  window.addEventListener('message', (e) => {
    // ✅ Verify it's from your backend
    if (e.origin !== 'https://ai-meeting-assistant-brhj.onrender.com') return;

    const data = e.data;

    // ✅ Basic check
    if (data && data.access_token) {
      accessToken = data.access_token;

      // Optional: Store in localStorage or chrome.storage
      localStorage.setItem('google_access_token', accessToken);

      // ✅ Update UI
      document.getElementById('login').disabled = true;
      document.getElementById('start').disabled = false;
      document.getElementById('status').innerText = 'Logged in with Google';
    }
  });
};

// Helper to convert Blob to Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // get base64 string only
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}




document.getElementById('start').onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const base64Audio = await blobToBase64(blob);

    document.getElementById('status').innerText = 'Uploading...';

    try {
      const uploadRes = await fetch('https://ai-meeting-assistant-brhj.onrender.com/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base64Audio, // send base64 encoded audio
          accessToken
        })
      });

      const { summary, docUrl } = await uploadRes.json();
      document.getElementById('summary').textContent = summary;
      document.getElementById('docLink').href = docUrl;
      document.getElementById('docLink').textContent = '📄 View Google Doc';
      document.getElementById('status').innerText = 'Done';
    } catch (err) {
      document.getElementById('status').innerText = 'Error uploading or summarizing.';
      console.error(err);
    }
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


