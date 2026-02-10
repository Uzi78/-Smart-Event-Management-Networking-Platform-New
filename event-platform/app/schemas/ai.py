from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class NetworkingRequest(BaseModel):
    user: dict
    attendees: list[dict]
    limit: int = Field(default=3, ge=1, le=20)


class NetworkingRecommendation(BaseModel):
    name: str
    reason: str
    starter: str
    score: float
    match: dict


class RagChatRequest(BaseModel):
    query: str
    snapshot: Optional[dict] = None


class RagChatResponse(BaseModel):
    answer: str
    source: Optional[str] = None
    score: float = 0.0
    metadata: dict[str, Any] = Field(default_factory=dict)


class AiHealthResponse(BaseModel):
    ok: bool
    rag_backend: str
