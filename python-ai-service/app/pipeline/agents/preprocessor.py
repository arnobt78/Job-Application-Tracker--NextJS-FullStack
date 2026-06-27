"""Agent 3 — Preprocessor: build prompt context blocks for downstream LLM agents.

Pure function — assembles structured text blocks from extracted + analyzed data.
"""

from __future__ import annotations
from dataclasses import dataclass
from app.pipeline.agents.analyzer import AnalyzedData


@dataclass
class PreprocessedContext:
    analyzed: AnalyzedData
    job_block: str          # Formatted job description for prompts
    user_block: str         # Formatted user profile for prompts
    fit_context: str        # Combined context for fit scoring


def preprocess(analyzed: AnalyzedData) -> PreprocessedContext:
    ext = analyzed.extracted

    job_lines = [
        f"Position: {ext.position}",
        f"Company: {ext.company}",
        f"Location: {ext.location}",
        f"Mode: {ext.mode}",
        f"Domain: {analyzed.domain}",
        f"Seniority: {analyzed.seniority}",
    ]
    if ext.salary_range:
        job_lines.append(f"Salary: {ext.salary_range}")
    if analyzed.is_remote:
        job_lines.append("Work arrangement: Fully remote")
    elif analyzed.is_hybrid:
        job_lines.append("Work arrangement: Hybrid")
    job_block = "\n".join(job_lines)

    user_lines = [f"Target role: {ext.target_role}"]
    if ext.skills:
        user_lines.append(f"Skills: {', '.join(ext.skills)}")
    if ext.resume_summary:
        user_lines.append(f"Background: {ext.resume_summary[:500]}")
    user_block = "\n".join(user_lines)

    fit_context = f"JOB:\n{job_block}\n\nCANDIDATE:\n{user_block}"

    return PreprocessedContext(
        analyzed=analyzed,
        job_block=job_block,
        user_block=user_block,
        fit_context=fit_context,
    )
