# English Buddy — Gemini Chatbot (Teacher Assistant)

 A lightweight chatbot project (frontend + backend) that acts as an English-teacher assistant for Indonesian learners. The backend uses Google Gemini via the `@google/genai` client and the frontend is a small vanilla JS app with a cute UI.

 ## Features
 - Backend: Node.js + Express, serves `public/` and exposes `/api/chat` POST endpoint.
 - Frontend: Static HTML/CSS/JS (Tailwind + small custom script) — interactive chat UI with message bubbles and markdown-formatted AI replies.
 - Conversation history is sent to the model so the assistant keeps context.
 - Simple, production-minded error handling and sanitization on the frontend.

 ## Repository structure

 - `index.js` — Express server + `/api/chat` endpoint.
 - `public/` — Frontend static files (`index.html`, `script.js`, `style.css`, etc.).
 - `.env` — Put your `GEMINI_API_KEY` here (not committed).

 ## API
 POST /api/chat
 - Request JSON body:
 ```json
 {
   "conversation": [
     { "role": "user", "text": "<user_message>" },
     { "role": "model", "text": "<previous_model_reply>" }
   ]
 }
 ```
 - Response JSON (200):
 ```json
 { "result": "<gemini_ai_response>" }
 ```
 - Error responses return status 4xx/5xx and JSON `{ "error": "message" }`.

 ## Quick start (clone and run)

 1. Clone the repo:

 ```bash
 git clone <your-repo-url>
 cd gemini-chatbot-api
 ```

 2. Install dependencies:

 ```bash
 npm install
 ```

 3. Create a `.env` file in the project root with your Gemini API key:

 ```
 GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
 ```

 4. Start the server (the Express app serves the frontend from `/public` and exposes the API on port 3000):

 ```bash
 node index.js
 ```

 Open your browser to:

 ```
 http://localhost:3000/
 ```

 The UI is served from the `public/` folder and will call the backend `/api/chat` endpoint.

 ## Testing the API (curl)

 Example curl request (replace host/port if changed):

 ```bash
 curl -X POST http://localhost:3000/api/chat \
   -H "Content-Type: application/json" \
   -d '{"conversation":[{"role":"user","text":"Hello, can you teach me simple past tense?"}]}'
 ```

 Expected response contains a `result` string with the model's reply.

 ## Notes & troubleshooting
 - Ensure `.env` contains a valid `GEMINI_API_KEY`. If the server logs errors, check the console where `node index.js` is running.
 - The frontend expects the API at `http://localhost:3000/api/chat`. If you serve the frontend separately (Live Server on a different port), update `public/script.js` fetch URL accordingly.
 - The frontend uses `marked` to render markdown and basic sanitization — do not rely on it for full XSS protection in a production environment.

 ## Customization
 - Adjust the system prompt in `index.js` (`ENGLISH_TEACHER_PROMPT`) to change assistant behavior or language style.
 - Tweak `public/style.css` or the Tailwind config inside `index.html` for UI personalization.

 ---
