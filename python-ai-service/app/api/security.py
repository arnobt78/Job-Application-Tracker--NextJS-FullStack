"""Shared X-Internal-Secret check for every non-health route."""

from __future__ import annotations
import hmac
import os

from fastapi import HTTPException, Request


def verify_secret(request: Request) -> None:
    """FastAPI dependency — fails closed when AI_SERVICE_SECRET is not configured."""
    secret = os.environ.get("AI_SERVICE_SECRET", "")
    if not secret:
        raise HTTPException(status_code=503, detail="AI_SERVICE_SECRET is not configured")
    header = request.headers.get("X-Internal-Secret", "")
    if not hmac.compare_digest(header.encode(), secret.encode()):
        raise HTTPException(status_code=401, detail="Invalid internal secret")
