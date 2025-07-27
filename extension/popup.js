document.addEventListener('DOMContentLoaded', () => {
  let accessToken = localStorage.getItem('google_access_token');

  // ✅ Google Login
  document.getElementById('login').onclick = () => {
    const authWindow = window.open(
      'https://ai-meeting-assistant-brhj.onrender.com/auth/google',
      '_blank',
      'width=500,height=600'
    );

    window.addEventListener('message', (e) => {
      if (e.origin !== 'https://ai-meeting-assistant-brhj.onrender.com') return;
      const data = e.data;
      if (data && data.access_token) {
        accessToken = data.access_token;
        localStorage.setItem('google_access_token', accessToken);
        document.getElementById('login').disabled = true;
        document.getElementById('status').innerText = '✅ Logged in with Google';
        document.getElementById('start').disabled = false;
      }
    });
  };

  // ✅ If already logged in
  if (accessToken) {
    document.getElementById('login').disabled = true;
    document.getElementById('status').innerText = '✅ Logged in with Google';
    document.getElementById('start').disabled = false;
  }

  // 🟢 Start Recording
  document.getElementById('start').onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'startRecording',
        accessToken: accessToken
      });
    });

    document.getElementById('status').innerText = '🎤 Recording started';
    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;
  };

  // 🔴 Stop Recording
  document.getElementById('stop').onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'stopRecording' });
    });

    document.getElementById('stop').disabled = true;
    document.getElementById('start').disabled = false;
    document.getElementById('status').innerText = '⏳ Processing...';
  };

  // ✅ Listen for transcription results from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showSummary') {
      document.getElementById('summary').textContent = message.summary;
      document.getElementById('docLink').href = message.docUrl || '#';
      document.getElementById('docLink').textContent = '📄 View Google Doc';
      document.getElementById('docLink').style.display = 'inline';
      document.getElementById('status').innerText = '✅ Summary Ready';
    }
  });
});
