let mediaRecorder;
let audioChunks = [];
let isRecording = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    if (isRecording) return;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        isRecording = true;
        audioChunks = [];

        mediaRecorder.addEventListener('dataavailable', event => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

          // Send blob to background or server
          uploadAudio(audioBlob, request.accessToken);
        });

        console.log('[AI Meeting Assistant] Recording started');
      })
      .catch(err => {
        console.error('[Mic Error]', err);
        alert('❌ Microphone access denied.');
      });

  } else if (request.action === 'stopRecording') {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      console.log('[AI Meeting Assistant] Recording stopped');
    }
  }
});

function uploadAudio(blob, accessToken) {
  const formData = new FormData();
  formData.append('audio', blob);

  fetch('https://ai-meeting-assistant-brhj.onrender.com/api/upload-audio', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Transcription result:', data);
      // Send result to popup if needed
      chrome.runtime.sendMessage({ action: 'showSummary', summary: data.summary });
    })
    .catch(err => {
      console.error('❌ Upload/Transcription error:', err);
    });
}
