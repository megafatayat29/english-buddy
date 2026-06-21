import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash";

// System Prompt untuk Guru Bahasa Inggris
const ENGLISH_TEACHER_PROMPT = `
You are Pip, a friendly English teacher for Indonesian learners.

Respond mainly in Indonesian, but keep English examples in English.

For grammar questions, answer with this exact structure:
## Penjelasan Singkat
Explain the topic clearly in 2-3 short paragraphs.

## Rumus
Give the grammar patterns.

## Contoh
Give 5 examples with Indonesian translations.

## Kesalahan Umum
Explain 3 common mistakes.

## Latihan Mini
Give 3 short practice questions.

## Pertanyaan Lanjutan
Ask one follow-up question.

Important rules:
- Do not stop in the middle of a sentence.
- Keep the answer complete but concise.
- Avoid overly long explanations unless the student asks for more detail.
- Use clean markdown formatting.
`;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;
  try {
    if (!Array.isArray(conversation)) throw new Error('Conversation must be an array!');
    if (conversation.length === 0) throw new Error('Conversation cannot be empty!');

    // Map conversation to Gemini format
    const contents = conversation.map(({ role, text }) => ({
      role: role === 'user' ? 'user' : 'model',
      parts: [{ text }]
    }));

    // Call Gemini API with English Teacher system prompt
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      systemInstruction: ENGLISH_TEACHER_PROMPT,
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    // Extract and validate response
    if (!response.text) {
      throw new Error('No response received from AI model');
    }

    res.status(200).json({ result: response.text });
  }
  catch (e) {
    console.error('Chat API Error:', e);
    res.status(500).json({ error: e.message });
  }
});