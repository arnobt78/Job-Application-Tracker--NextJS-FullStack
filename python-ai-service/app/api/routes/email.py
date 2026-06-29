"""POST /parse-email — LLM-powered email classification and job extraction.

Classifies inbound emails as application confirmations and extracts company/position.
Called by Next.js inbound email webhook after verifying Resend signature.
"""

from __future__ import annotations
import os

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.llm import router as llm_router

router = APIRouter(tags=["email"])


def _verify_secret(request: Request) -> None:
    secret = os.environ.get("AI_SERVICE_SECRET")
    if not secret:
        return
    header = request.headers.get("X-Internal-Secret", "")
    if header != secret:
        raise HTTPException(status_code=401, detail="Invalid internal secret")


class ParseEmailRequest(BaseModel):
    subject: str
    body: str
    from_addr: str


class ParseEmailResponse(BaseModel):
    is_application_confirmation: bool
    company: str | None
    position: str | None
    confidence: float  # 0.0 – 1.0


_SYSTEM = (
    "You are an email parser specialising in job application confirmations. "
    "Be precise. Only flag emails that are clearly application receipts or confirmations."
)


@router.post("/parse-email", response_model=ParseEmailResponse)
async def parse_email(
    payload: ParseEmailRequest,
    _: None = Depends(_verify_secret),
) -> ParseEmailResponse:
    """Use LLM to classify an email and extract job application details."""
    body_preview = payload.body[:2000]

    prompt = f"""Analyse this email and determine if it is a job application confirmation.

From: {payload.from_addr}
Subject: {payload.subject}
Body (truncated): {body_preview}

Respond ONLY in this exact format (no markdown, no extra text):
IS_APPLICATION: <yes|no>
COMPANY: <company name or UNKNOWN>
POSITION: <job title or UNKNOWN>
CONFIDENCE: <float 0.0-1.0>"""

    try:
        result = await llm_router.complete(prompt, _SYSTEM, max_tokens=150)
        return _parse_response(result.text)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"LLM unavailable: {exc}") from exc


def _parse_response(text: str) -> ParseEmailResponse:
    """Parse structured LLM output into ParseEmailResponse."""
    lines: dict[str, str] = {}
    for line in text.strip().splitlines():
        if ": " in line:
            key, _, val = line.partition(": ")
            lines[key.strip().upper()] = val.strip()

    is_application = lines.get("IS_APPLICATION", "no").lower() == "yes"
    company = lines.get("COMPANY")
    position = lines.get("POSITION")

    # Normalise UNKNOWN → None
    if company and company.upper() == "UNKNOWN":
        company = None
    if position and position.upper() == "UNKNOWN":
        position = None

    try:
        confidence = float(lines.get("CONFIDENCE", "0.5"))
        confidence = max(0.0, min(1.0, confidence))
    except ValueError:
        confidence = 0.5

    return ParseEmailResponse(
        is_application_confirmation=is_application,
        company=company,
        position=position,
        confidence=confidence,
    )
