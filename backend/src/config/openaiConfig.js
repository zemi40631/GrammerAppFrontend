const OpenAI = require("openai");

// ✅ Initialize OpenAI Client using API Key from `.env`
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure your .env contains OPENAI_API_KEY
});

module.exports = openai;
 
