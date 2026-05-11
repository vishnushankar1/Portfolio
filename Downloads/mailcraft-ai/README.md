# MailCraft AI — AI-Powered Email Generator

Generate professional, context-aware emails instantly using Claude (Anthropic's AI).
Built with **FastAPI** (backend) + **React + Vite + Tailwind CSS** (frontend).

---

## Features

| Feature | Details |
|---|---|
| AI Email Generation | Claude generates complete, ready-to-send emails |
| Streaming | Responses stream in real-time, token by token |
| Tone Selector | Professional / Friendly / Formal / Casual |
| Length Selector | Short / Medium / Long |
| Subject Line | Auto-generated with every email |
| Copy to Clipboard | One click to copy subject + body |
| Email History | Stored in SQLite; browse, reload, and delete past emails |
| Error Handling | API errors, network failures, and validation all surfaced clearly |
| Stop Generation | Cancel mid-stream at any time |
| Responsive UI | Works on all screen sizes |

---

## Project Structure

```
mailcraft-ai/
├── backend/
│   ├── main.py              # FastAPI app — all routes, streaming, DB
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variable template
│   └── emails.db            # Auto-created SQLite database
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # Proxies /api/* → localhost:8000
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Root component & state orchestration
│       ├── index.css         # Tailwind directives + global styles
│       ├── api/
│       │   └── emailService.js   # All fetch calls to the backend
│       ├── hooks/
│       │   └── useEmailGenerator.js  # Generation state machine
│       └── components/
│           ├── Header.jsx
│           ├── PromptForm.jsx    # Left panel — input form
│           ├── ToneSelector.jsx
│           ├── LengthSelector.jsx
│           ├── EmailOutput.jsx   # Right panel — streaming output
│           └── HistoryPanel.jsx  # Slide-in history drawer
│
└── README.md
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- An Anthropic API key → https://console.anthropic.com/

---

### 1. Clone / download the project

```bash
# If you have it as a zip, unzip it first, then:
cd mailcraft-ai
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

Open `.env` and add your API key:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Visit http://localhost:8000/docs to explore the interactive API docs.

---

### 3. Frontend setup

Open a **new terminal tab**:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

You should see:
```
  VITE v5.x ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | — | Your Anthropic API key |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173,...` | CORS origins (comma-separated) |
| `DB_PATH` | No | `emails.db` | SQLite database file path |

### Frontend

Create `frontend/.env.local` only if your backend runs on a different host/port:

```env
VITE_API_URL=http://your-backend-host:8000
```

In development, leave this empty — Vite's proxy handles `/api/*` → `localhost:8000` automatically.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/health` | Detailed health |
| `POST` | `/api/generate` | Stream an AI email (SSE) |
| `GET` | `/api/history` | List saved emails |
| `POST` | `/api/history` | Save an email |
| `DELETE` | `/api/history/{id}` | Delete one email |
| `DELETE` | `/api/history` | Clear all history |

### POST `/api/generate` — Request body

```json
{
  "prompt": "Write a follow-up email after a job interview",
  "tone": "professional",
  "length": "Medium"
}
```

- `tone`: `professional` | `friendly` | `formal` | `casual`
- `length`: `Short` | `Medium` | `Long`

### SSE response format

Each chunk is a Server-Sent Event:

```
data: {"type": "text", "text": "Subject: Follow"}
data: {"type": "text", "text": "-Up After Our Interview"}
...
data: [DONE]
```

Error event:

```
data: {"type": "error", "message": "Invalid API key."}
```

---

## Production Build

### Frontend

```bash
cd frontend
npm run build
# Outputs to frontend/dist/
```

Serve the `dist/` folder from any static host (Vercel, Netlify, S3, nginx).

### Backend

For production, use gunicorn with uvicorn workers:

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Set `ALLOWED_ORIGINS` to your frontend's production URL.

---

## Troubleshooting

**"ANTHROPIC_API_KEY is not set"**
→ Make sure you created `backend/.env` from `.env.example` and added your key.

**Frontend shows "Network error — make sure the backend is running"**
→ Confirm the backend is running on port 8000 (`uvicorn main:app --reload --port 8000`).

**CORS errors in the browser console**
→ Add your frontend origin to `ALLOWED_ORIGINS` in `backend/.env`.

**History not loading**
→ The SQLite database (`emails.db`) is created automatically when the backend starts. Make sure the backend has write permission in its directory.

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Backend | FastAPI, Python, Uvicorn |
| Streaming | Server-Sent Events (SSE) |
| Database | SQLite (via Python's built-in `sqlite3`) |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Notifications | react-hot-toast |

---

## License

MIT — free to use, modify, and distribute.
