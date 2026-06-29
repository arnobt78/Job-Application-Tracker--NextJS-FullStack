"""POST /skill-gap — LLM-powered semantic skill matching.

Unlike the keyword-based computeSkillGap in Next.js, this endpoint uses the LLM
to do semantic matching, identify implied skills, and generate a prioritised learning path.
"""

from __future__ import annotations
import os

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.llm import router as llm_router

router = APIRouter(tags=["skills"])


def _verify_secret(request: Request) -> None:
    secret = os.environ.get("AI_SERVICE_SECRET")
    if not secret:
        return
    header = request.headers.get("X-Internal-Secret", "")
    if header != secret:
        raise HTTPException(status_code=401, detail="Invalid internal secret")


class SkillGapRequest(BaseModel):
    job_description: str
    user_skills: list[str]
    position: str = ""
    company: str = ""


class SkillGapResponse(BaseModel):
    matched: list[str]
    missing: list[str]
    bonus: list[str]
    match_pct: int
    ai_explanation: str | None
    learning_path: list[str]
    confidence: str  # high | medium | low


_SYSTEM = (
    "You are a senior technical recruiter and career coach. "
    "Analyse candidate skills against job requirements with semantic understanding. "
    "Be precise, honest, and actionable. Never fabricate qualifications."
)


@router.post("/skill-gap", response_model=SkillGapResponse)
async def analyse_skill_gap(
    payload: SkillGapRequest,
    _: None = Depends(_verify_secret),
) -> SkillGapResponse:
    """Semantic skill gap analysis using the LLM fallback chain."""
    if not payload.user_skills:
        raise HTTPException(status_code=422, detail="user_skills is empty")

    skills_list = ", ".join(payload.user_skills)
    context = f"Position: {payload.position}\nCompany: {payload.company}\n\nJob Description:\n{payload.job_description[:3000]}"

    prompt = f"""Analyse this candidate's skills against the job requirements.

Candidate skills: {skills_list}

{context}

Respond ONLY in this exact format (no markdown, no extra text):
MATCHED: <comma-separated skills from candidate that match job requirements>
MISSING: <comma-separated key required skills the candidate lacks>
BONUS: <comma-separated candidate skills not required but impressive for this role>
MATCH_PCT: <integer 0-100>
EXPLANATION: <2-3 sentences explaining the overall fit>
LEARNING_PATH: <numbered list of top 3 skills to learn, separated by |>
CONFIDENCE: <high|medium|low based on how much job description detail was available>"""

    try:
        result = await llm_router.complete(prompt, _SYSTEM, max_tokens=600)
        return _parse_llm_response(result.text)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"LLM unavailable: {exc}") from exc


def _parse_llm_response(text: str) -> SkillGapResponse:
    """Parse structured LLM output into SkillGapResponse."""
    lines: dict[str, str] = {}
    for line in text.strip().splitlines():
        if ": " in line:
            key, _, val = line.partition(": ")
            lines[key.strip().upper()] = val.strip()

    def _split(key: str) -> list[str]:
        raw = lines.get(key, "")
        return [s.strip() for s in raw.split(",") if s.strip()] if raw else []

    matched = _split("MATCHED")
    missing = _split("MISSING")
    bonus = _split("BONUS")

    try:
        match_pct = int(lines.get("MATCH_PCT", "0"))
        match_pct = max(0, min(100, match_pct))
    except ValueError:
        match_pct = 0

    explanation = lines.get("EXPLANATION") or None
    learning_raw = lines.get("LEARNING_PATH", "")
    learning_path = [s.strip().lstrip("0123456789. ") for s in learning_raw.split("|") if s.strip()]

    confidence_raw = lines.get("CONFIDENCE", "medium").lower()
    confidence = confidence_raw if confidence_raw in ("high", "medium", "low") else "medium"

    return SkillGapResponse(
        matched=matched,
        missing=missing,
        bonus=bonus,
        match_pct=match_pct,
        ai_explanation=explanation,
        learning_path=learning_path,
        confidence=confidence,
    )
