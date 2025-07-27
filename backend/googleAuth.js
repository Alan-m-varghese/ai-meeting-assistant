// backend/routes/googleAuth.js
const express = require("express");
const router = express.Router();
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Redirect to Google
router.get("/google", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/documents"],
    prompt: "consent",
  });
  res.redirect(authUrl);
});

// Step 2: Callback with code
router.get("/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Instead of redirecting to frontend, return tokens as a JSON response
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage(${JSON.stringify(tokens)}, "*");
            window.close();
          </script>
          <p>Authentication successful. You can close this tab.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).send("Authentication failed");
  }
});

module.exports = router;
