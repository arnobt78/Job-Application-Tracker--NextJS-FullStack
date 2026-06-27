"""Agent 2 — Analyzer: assess the role type, seniority, and domain signals.

Pure function — derives metadata from position title for use by later agents.
"""

from __future__ import annotations
import re
from dataclasses import dataclass
from app.pipeline.agents.extractor import ExtractedData


@dataclass
class AnalyzedData:
    extracted: ExtractedData
    seniority: str        # junior | mid | senior | lead | executive
    domain: str           # engineering | design | product | data | marketing | ops | finance | other
    is_remote: bool
    is_hybrid: bool


_SENIORITY_PATTERNS = [
    (r"\b(staff|principal|director|vp|head of|chief|cto|ceo|cfo|coo)\b", "executive"),
    (r"\b(lead|manager|architect|senior|sr\.?)\b", "senior"),
    (r"\b(junior|jr\.?|entry.?level|associate|intern)\b", "junior"),
    (r"\b(ii|iii|iv|2|3|4)\b", "mid"),
]

_DOMAIN_PATTERNS = [
    (r"\b(engineer|dev|developer|swe|sde|software|backend|frontend|fullstack|devops|sre|platform|infra|security|mobile|ios|android|ml|ai)\b", "engineering"),
    (r"\b(data|analyst|analytics|scientist|bi|etl|pipeline|warehouse|dbt)\b", "data"),
    (r"\b(design|ux|ui|product design|graphic|visual|brand)\b", "design"),
    (r"\b(product manager|pm|product owner|po)\b", "product"),
    (r"\b(marketing|growth|seo|content|social|demand gen|revenue)\b", "marketing"),
    (r"\b(finance|accounting|controller|fp&a|treasury|tax)\b", "finance"),
    (r"\b(operations|ops|program manager|project manager|scrum|agile)\b", "ops"),
]


def analyze(extracted: ExtractedData) -> AnalyzedData:
    title_lower = extracted.position.lower()

    seniority = "mid"
    for pattern, level in _SENIORITY_PATTERNS:
        if re.search(pattern, title_lower):
            seniority = level
            break

    domain = "other"
    for pattern, dom in _DOMAIN_PATTERNS:
        if re.search(pattern, title_lower):
            domain = dom
            break

    return AnalyzedData(
        extracted=extracted,
        seniority=seniority,
        domain=domain,
        is_remote=extracted.workplace_type == "remote",
        is_hybrid=extracted.workplace_type == "hybrid",
    )
