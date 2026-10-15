"""Free-tier LLM provider registry — data only, order = fallback priority.

Follows docs/LLM_MODEL_SELECTION.md: every provider speaks the OpenAI-compatible
`/chat/completions` shape, so one generic client (openai_compat.py) serves all of them.
Swap a model ID here when a provider deprecates one; the router never changes.

Model IDs verified 2026-10-15 against each provider's live models list / deprecation page.
"""

from __future__ import annotations
import os
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ModelSpec:
    id: str
    # Extra request fields for this model only (e.g. reasoning controls)
    params: dict[str, Any] = field(default_factory=dict)
    # Reasoning tokens count against max_tokens — reserve headroom so the answer is not cut off
    reasoning: bool = False


@dataclass(frozen=True)
class ProviderSpec:
    id: str
    env_key: str
    base_url: str
    models: tuple[ModelSpec, ...]
    headers: dict[str, str] = field(default_factory=dict)
    # Extra request fields sent with every model of this provider
    params: dict[str, Any] = field(default_factory=dict)

    def api_key(self) -> str:
        """Read at call time so a key added to the environment needs no code change."""
        return os.environ.get(self.env_key, "").strip()


_GPT_OSS_LOW = {"reasoning_effort": "low"}

GROQ = ProviderSpec(
    id="groq",
    env_key="GROQ_API_KEY",
    base_url="https://api.groq.com/openai/v1",
    models=(
        ModelSpec("openai/gpt-oss-20b", _GPT_OSS_LOW, reasoning=True),
        ModelSpec("openai/gpt-oss-120b", _GPT_OSS_LOW, reasoning=True),
        # Preview tier on Groq — can be discontinued at short notice, so it stays last
        ModelSpec("qwen/qwen3.8-27b", {"reasoning_effort": "none"}),
    ),
)

GEMINI = ProviderSpec(
    id="gemini",
    env_key="GEMINI_API_KEY",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    models=tuple(
        ModelSpec(model_id, {"reasoning_effort": "low"}, reasoning=True)
        for model_id in (
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash",
            "gemini-3.6-flash",
            "gemini-3.1-flash-lite",
        )
    ),
)

OPENROUTER = ProviderSpec(
    id="openrouter",
    env_key="OPENROUTER_API_KEY",
    base_url="https://openrouter.ai/api/v1",
    # Only `:free` variants — the plain IDs are billed
    models=tuple(
        ModelSpec(model_id, reasoning=True)
        for model_id in (
            "nvidia/nemotron-3-super-120b-a12b:free",
            "google/gemma-4-31b-it:free",
            "google/gemma-4-26b-a4b-it:free",
            "nvidia/nemotron-3.5-lightning:free",
            # Dynamic router across whatever free models are currently live
            "openrouter/free",
        )
    ),
    headers={"HTTP-Referer": "https://jobify.app", "X-Title": "Jobify AI"},
    # Normalised reasoning control; ignored by models that do not reason
    params={"reasoning": {"effort": "low", "exclude": True}},
)

HUGGINGFACE = ProviderSpec(
    id="huggingface",
    env_key="HF_TOKEN",
    base_url="https://router.huggingface.co/v1",
    models=(
        ModelSpec("openai/gpt-oss-20b:fastest", _GPT_OSS_LOW, reasoning=True),
        ModelSpec("openai/gpt-oss-120b:fastest", _GPT_OSS_LOW, reasoning=True),
        ModelSpec("google/gemma-4-31B-it:fastest"),
        # Emits <think> blocks; the client strips them
        ModelSpec("Qwen/Qwen3-8B", reasoning=True),
    ),
)

PROVIDERS: tuple[ProviderSpec, ...] = (GROQ, GEMINI, OPENROUTER, HUGGINGFACE)
