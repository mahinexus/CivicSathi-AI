# CivicSathi AI
Your Rights. Your Benefits. Your Guide.

**Stack:** React (Vite) + Tailwind CSS + React Router + Lucide icons · Node.js + Express.js · MongoDB (Mongoose) · Gemini API

## Run in VS Code (quickest)
1. Install Node 18+ and VS Code. Open the folder: **File > Open Workspace from File...** and choose `civicsathi.code-workspace`. Accept the recommended extensions.
2. MongoDB: use a free MongoDB Atlas URI, a local MongoDB, or run `docker compose up -d` (task: *Start MongoDB (Docker)*).
3. Open the terminal (Ctrl+`) and run:
```bash
npm run setup     # creates server/.env and installs everything
# edit server/.env: add GEMINI_API_KEY, set JWT_SECRET (and MONGO_URI if not local)
npm run seed      # load sample schemes
npm run dev       # starts API (5000) and website (5173) together
```
4. Open http://localhost:5173. You can also press **Ctrl+Shift+B** to start both, or **Terminal > Run Task** for setup and seed.
5. To debug: **Run and Debug** panel > *Full stack: API + Chrome*. Start the site with `npm run dev --prefix client` first, then launch it (the API runs under the debugger, so do not also run `npm run dev`).

## API keys
`server/.env` is already filled in (keys, JWT secret, admin key). Only `MONGO_URI` may need changing if you use Atlas. Never upload `.env` to GitHub (it is in `.gitignore`) or share this folder with the keys inside.

## Choosing the AI provider
In `server/.env` set `AI_PROVIDER=gemini` (needs `GEMINI_API_KEY`) or `AI_PROVIDER=claude` (needs `ANTHROPIC_API_KEY`, model set by `CLAUDE_MODEL`). Chat, document scanning, guidance and rejection explanations all use the chosen provider.

## Manual setup (two terminals)
Requirements: Node 18+, MongoDB running locally (or an Atlas URI), a Gemini API key from https://aistudio.google.com/apikey

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed              # loads the sample government schemes
npm run dev               # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # App on http://localhost:5173
```

## API
| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/register, /login | Sign up / log in (JWT) |
| GET/PUT | /api/auth/me | Profile |
| GET | /api/schemes?q=&category= | Smart search |
| POST | /api/schemes/eligibility | Eligibility checker |
| GET | /api/schemes/recommend | Personalised recommendations (login) |
| GET | /api/schemes/:id/guidance?lang= | Gemini application guide |
| POST | /api/applications | Apply, returns application ID (login) |
| GET | /api/applications/track/:appId | Public status tracking |
| POST | /api/applications/:appId/explain | Gemini rejection explanation (login) |
| PATCH | /api/applications/:appId/status | Update status, needs `x-admin-key` header |
| POST | /api/ai/chat | Gemini chat, English and Hindi |
| POST | /api/ai/scan | Gemini OCR of an uploaded document (login) |

Try status tracking: apply to a scheme, then change its status:
```bash
curl -X PATCH localhost:5000/api/applications/CS2026-1234/status -H "x-admin-key: <ADMIN_KEY>" -H "content-type: application/json" -d '{"status":"Rejected","rejectionReason":"Name mismatch between Aadhaar and bank records"}'
```

## Notes
- The Gemini key stays on the server only. Never put it in client code.
- Scheme data is sample data. Verify details on the official sites before relying on them.
- Voice input uses the browser Web Speech API (works best in Chrome).
