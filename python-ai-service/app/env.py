"""Local-dev env loading — production (Coolify/Docker) injects env vars directly.

Reads the repo-root .env.local first (single source shared with Next.js), then an
optional python-ai-service/.env for service-only overrides. Never overrides values
already present in the process environment.
"""

from __future__ import annotations
from pathlib import Path

from dotenv import load_dotenv

_SERVICE_ROOT = Path(__file__).resolve().parents[1]


def load_local_env() -> None:
    for path in (_SERVICE_ROOT.parent / ".env.local", _SERVICE_ROOT / ".env"):
        if path.is_file():
            load_dotenv(path, override=False)
