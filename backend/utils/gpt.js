const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeTextWithGPT(text) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Summarize this meeting transcript clearly.' },
      { role: 'user', content: text }
    ],
    temperature: 0.5
  });
  return response.choices[0].message.content.trim();
}

module.exports = { summarizeTextWithGPT };
