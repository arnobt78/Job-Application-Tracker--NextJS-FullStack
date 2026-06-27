"""Shared types for the LLM router and provider clients."""

from __future__ import annotations
from dataclasses import dataclass


@dataclass
class LLMResult:
    text: str
    model_used: str
    provider: str
    latency_ms: int
