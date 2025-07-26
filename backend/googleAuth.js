const express = require('express');
const { google } = require('googleapis');
const authRouter = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

authRouter.get('/', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/documents']
  });
  res.redirect(url);
});

authRouter.get('/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  res.json(tokens);
});

async function createGoogleDoc(summary, accessToken) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const docs = google.docs({ version: 'v1', auth: oauth2Client });
  const doc = await docs.documents.create({ requestBody: { title: 'Meeting Summary' } });
  await docs.documents.batchUpdate({
    documentId: doc.data.documentId,
    requestBody: { requests: [{ insertText: { location: { index: 1 }, text: summary } }] }
  });
  return `https://docs.google.com/document/d/${doc.data.documentId}`;
}

module.exports = { authRouter, createGoogleDoc };
