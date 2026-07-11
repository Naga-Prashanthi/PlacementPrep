const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('./models/User');

// Middleware to use protection directly mounted
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



// Interview Simulator
router.post('/interview', async (req, res) => {
  try {
    const { question, answer } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Interview Question: "${question}"
Candidate Answer: "${answer}"
Provide a brief evaluation out of 10 and constructive feedback. Format JSON: { "score": number, "feedback": "string", "idealAnswer": "string" }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if(text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    res.json(JSON.parse(text));
  } catch(err) {
    res.status(500).json({ message: "Interview Simulator Error: " + err.message });
  }
});

// Learning Path Generator
router.post('/learning-path', async (req, res) => {
  try {
    const { targetCompany, focusArea } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Generate a structured 4-week learning path for ${targetCompany} targeting ${focusArea}. 
Return JSON format: { "path": [ { "week": 1, "focus": "string", "topics": ["string"] } ] }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if(text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    res.json(JSON.parse(text));
  } catch(err) {
    res.status(500).json({ message: "Path Generator Error: " + err.message });
  }
});

module.exports = router;
