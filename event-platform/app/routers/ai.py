from __future__ import annotations

from fastapi import APIRouter

from app.database import get_database

from app.ai.networking import conversation_starter, recommend_connections
from app.ai.rag import RagEngine
from app.schemas.ai import (
    AiHealthResponse,
    NetworkingRecommendation,
    NetworkingRequest,
    RagChatRequest,
    RagChatResponse,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])

_engine = RagEngine()


@router.get("/health", response_model=AiHealthResponse)
async def ai_health():
    return AiHealthResponse(ok=True, rag_backend="sentence-transformers" if _engine._use_st else "token-jaccard")


@router.post("/networking/recommendations", response_model=list[NetworkingRecommendation])
async def networking_recommendations(payload: NetworkingRequest):
    subject = payload.user or {}
    candidates = payload.attendees or []

    matches = recommend_connections(subject, candidates, limit=payload.limit, min_score=0.0)
    results: list[NetworkingRecommendation] = []

    for entry in matches:
        match = entry["match"]
        overlap = entry.get("overlap", {})
        results.append(
            NetworkingRecommendation(
                name=match.get("name", "Unknown"),
                reason=entry.get("reason", ""),
                starter=conversation_starter(subject, match, overlap),
                score=float(entry.get("score", 0.0)),
                match=match,
            )
        )

    return results


@router.get("/rag/snapshot", response_model=dict)
async def rag_snapshot():
    """Build a frontend-shaped snapshot from MongoDB.

    This helps keep your RAG JSON aligned with the frontend types:
    - Event uses name/startDate/location
    - Attendees are derived from registrations (until a richer attendee profile model exists)
    """

    db = await get_database()

    events_raw = await db.events.find({}).sort("start_date", 1).to_list(200)
    events = []
    for e in events_raw:
        events.append(
            {
                "id": str(e.get("_id")),
                "name": e.get("name"),
                "description": e.get("description"),
                "startDate": (e.get("start_date").isoformat() if e.get("start_date") else None),
                "endDate": (e.get("end_date").isoformat() if e.get("end_date") else None),
                "location": e.get("location"),
                "organizerId": e.get("organizer_id"),
                "capacity": e.get("capacity"),
                "registeredCount": e.get("registered_count", 0),
                "status": (str(e.get("status")) if e.get("status") is not None else "draft"),
                "revenue": e.get("revenue", 0),
            }
        )

    registrations_raw = await db.registrations.find({}).sort("created_at", -1).to_list(500)
    seen_attendees: set[str] = set()
    attendees = []
    for r in registrations_raw:
        form_responses = r.get("form_responses")
        interests: list[str] = []
        if isinstance(form_responses, dict):
            raw_interests = form_responses.get("interests")
            if isinstance(raw_interests, list):
                interests = [str(x) for x in raw_interests if x]
            elif isinstance(raw_interests, str):
                interests = [s.strip() for s in raw_interests.split(",") if s.strip()]

        attendee_id = str(r.get("user_id") or r.get("_id"))
        if attendee_id in seen_attendees:
            continue
        seen_attendees.add(attendee_id)
        name = " ".join([r.get("first_name") or "", r.get("last_name") or ""]).strip() or "Attendee"
        attendees.append(
            {
                "id": attendee_id,
                "name": name,
                "email": r.get("email"),
                "company": r.get("company"),
                "industry": None,
                "role": r.get("job_title"),
                "interests": interests,
            }
        )

    faq = [
        {
            "question": "Where can I find event schedules and venue information?",
            "answer": "Use the Dashboard for event summaries and the Venue Editor for layout details. For live sessions, check the Event Hub.",
            "category": "logistics",
            "audience": "attendee",
        }
    ]

    return {"events": events, "sessions": [], "attendees": attendees, "faq": faq}


@router.post("/rag/chat", response_model=RagChatResponse)
async def rag_chat(payload: RagChatRequest):
    snapshot = payload.snapshot
    if snapshot is None:
        snapshot = await rag_snapshot()

    documents = _engine.build_documents(snapshot)
    result = _engine.answer(payload.query, documents)
    return RagChatResponse(**result)
