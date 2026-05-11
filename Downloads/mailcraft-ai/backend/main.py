"""
MailCraft AI - FastAPI Backend
Handles email generation via Groq API with streaming,
and email history via SQLite.
"""
import json
import os
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Load .env from the same directory as this script (always reliable)
# ---------------------------------------------------------------------------

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

DB_PATH = os.getenv("DB_PATH", str(Path(__file__).parent / "emails.db"))


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS email_history (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt      TEXT    NOT NULL,
                tone        TEXT    NOT NULL,
                length      TEXT    NOT NULL,
                subject     TEXT,
                body        TEXT    NOT NULL,
                created_at  TEXT    DEFAULT (datetime('now'))
            )
            """
        )
        conn.commit()


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="MailCraft AI",
    description="AI-powered email generation API using Groq",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Groq client
# ---------------------------------------------------------------------------

def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not set. Add it to your .env file.",
        )

    return Groq(api_key=api_key)


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------

TONE_DESCRIPTIONS = {
    "professional": "professional, business-focused, and polished",
    "friendly": "warm, friendly, and approachable while still appropriate",
    "formal": "very formal, strict, and ceremonial",
    "casual": "casual, relaxed, and conversational",
}

LENGTH_DESCRIPTIONS = {
    "Short": "concise — 3 to 5 sentences maximum",
    "Medium": "moderate — 2 to 3 well-developed paragraphs",
    "Long": "detailed and comprehensive — 4 to 6 paragraphs",
}


def build_prompt(prompt: str, tone: str, length: str) -> str:
    tone_desc = TONE_DESCRIPTIONS.get(tone.lower(), tone)
    length_desc = LENGTH_DESCRIPTIONS.get(length, "moderate — 2 to 3 paragraphs")

    return f"""
You are an expert email writer with years of experience crafting compelling, effective emails across every context and industry.

Task: Write a complete, ready-to-send email based on the following request.

User request: {prompt}
Tone: {tone_desc}
Length: {length_desc}

FORMAT — respond with ONLY the email, nothing else:

Subject: [a clear, specific, and compelling subject line]

[full email body: appropriate greeting, well-structured body, professional sign-off using "[Your Name]" as the name placeholder]

Rules:
- Line 1 must be "Subject: …"
- One blank line between the subject and the body
- Match the {tone} tone throughout every sentence
- Keep the email {length_desc}
- Use proper grammar and punctuation
- Never include meta-commentary, explanations, or markdown — only the email text itself
"""


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=2000)
    tone: str = Field(
        "professional",
        pattern="^(professional|friendly|formal|casual)$"
    )
    length: str = Field(
        "Medium",
        pattern="^(Short|Medium|Long)$"
    )


class SaveHistoryRequest(BaseModel):
    prompt: str
    tone: str
    length: str
    subject: Optional[str] = None
    body: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "MailCraft AI API is running",
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/generate", tags=["Email"])
async def generate_email(req: GenerateRequest):
    client = get_groq_client()

    prompt = build_prompt(req.prompt, req.tone, req.length)

    def stream():
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_completion_tokens=1500,
                top_p=1,
                stream=True,
            )

            for chunk in completion:
                if (
                    chunk.choices
                    and chunk.choices[0].delta
                    and chunk.choices[0].delta.content
                ):
                    text = chunk.choices[0].delta.content
                    data = json.dumps({"type": "text", "text": text})
                    yield f"data: {data}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            err = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {err}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        },
    )


@app.post("/api/history", tags=["History"])
def save_history(req: SaveHistoryRequest):
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO email_history
            (prompt, tone, length, subject, body)
            VALUES (?, ?, ?, ?, ?)
            """,
            (req.prompt, req.tone, req.length, req.subject, req.body),
        )
        conn.commit()
        return {"id": cursor.lastrowid, "message": "Saved"}


@app.get("/api/history", tags=["History"])
def get_history(limit: int = Query(default=20, le=100)):
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT *
            FROM email_history
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,)
        ).fetchall()

    return [dict(r) for r in rows]


@app.delete("/api/history/{item_id}", tags=["History"])
def delete_history_item(item_id: int):
    with get_db() as conn:
        conn.execute(
            "DELETE FROM email_history WHERE id = ?",
            (item_id,)
        )
        conn.commit()

    return {"message": "Deleted"}


@app.delete("/api/history", tags=["History"])
def clear_all_history():
    with get_db() as conn:
        conn.execute("DELETE FROM email_history")
        conn.commit()

    return {"message": "History cleared"}