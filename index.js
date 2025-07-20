const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // <--- WAJIB untuk req.body

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Add a specific route for the root URL ('/') to serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
const chat = model.startChat({
  history: [],
  generationConfig: {
    temperature: 0.9,
    topP: 1,
    topK: 1,
  },
  systemInstruction: `
    Kamu adalah chatbot yang friendly, gaul, dan pintar.
    Gaya bicaramu santai, seru, kadang lucu, tapi tetap membantu pengguna dengan penjelasan yang jelas dan mudah dimengerti.
    Jangan terlalu kaku atau terlalu formal.
    Kalau ada istilah teknis, coba jelaskan dengan gaya anak muda yang relate.
  `
});

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const raw = response.text();
    res.json({ reply: raw });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Gemini API server running at http://localhost:${port}`);
});
