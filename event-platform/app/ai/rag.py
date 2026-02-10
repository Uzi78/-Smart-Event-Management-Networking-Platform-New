"""Lightweight RAG chatbot.

This is integrated from the approach in event_ai/ai/chatbot.py, but adapted to:
- Accept frontend-shaped JSON (types.ts compatible)
- Avoid hard dependency on SentenceTransformers at runtime

If `sentence_transformers` is installed, we use it. Otherwise we fall back to a simple
token-overlap similarity.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable


def _tokenize(text: str) -> set[str]:
    return {t.strip(".,!?;:()[]{}\"'`).").lower() for t in text.split() if t.strip()}


def _jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


@dataclass
class RagDocument:
    text: str
    answer: str
    source: str
    metadata: dict[str, Any]
    embedding: Any | None = None


class RagEngine:
    def __init__(self) -> None:
        self._model = None
        self._use_st = False
        try:
            from sentence_transformers import SentenceTransformer  # type: ignore

            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            self._use_st = True
        except Exception:
            self._model = None
            self._use_st = False

    def _encode(self, text: str):
        if not self._use_st:
            return None
        return self._model.encode(text, convert_to_tensor=True)

    def build_documents(self, snapshot: dict) -> list[RagDocument]:
        docs: list[RagDocument] = []

        for faq in snapshot.get("faq", []) or []:
            q = faq.get("question") or "FAQ"
            a = faq.get("answer") or ""
            docs.append(
                RagDocument(
                    text=f"FAQ: {q}",
                    answer=a,
                    source="faq",
                    metadata={
                        "question": q,
                        "category": faq.get("category"),
                        "audience": faq.get("audience"),
                    },
                )
            )

        for event in snapshot.get("events", []) or []:
            name = event.get("name") or "Untitled event"
            loc = event.get("location") or "TBD"
            start = event.get("startDate") or event.get("start_date") or ""
            desc = event.get("description") or ""
            summary = f"Event {name} at {loc} starting {start}. {desc}".strip()
            docs.append(
                RagDocument(
                    text=summary,
                    answer=summary,
                    source="event",
                    metadata={
                        "id": event.get("id"),
                        "name": name,
                        "location": loc,
                        "start": start,
                    },
                )
            )

        for attendee in snapshot.get("attendees", []) or []:
            name = attendee.get("name") or "Unknown attendee"
            company = attendee.get("company") or ""
            industry = attendee.get("industry") or ""
            role = attendee.get("role") or ""
            interests = ", ".join(attendee.get("interests") or [])
            summary = (
                f"Attendee {name} {f'({role})' if role else ''} {f'at {company}' if company else ''} "
                f"{f'in {industry}' if industry else ''}. Interests: {interests or 'not specified'}."
            ).strip()
            docs.append(
                RagDocument(
                    text=summary,
                    answer=summary,
                    source="attendee",
                    metadata={
                        "id": attendee.get("id"),
                        "name": name,
                        "company": company,
                        "industry": industry,
                        "role": role,
                        "interests": attendee.get("interests") or [],
                    },
                )
            )

        for session in snapshot.get("sessions", []) or []:
            title = session.get("title") or "Untitled session"
            speaker = session.get("speaker") or ""
            start = session.get("startTime") or session.get("start") or ""
            end = session.get("endTime") or session.get("end") or ""
            room = session.get("venue") or session.get("room") or ""
            tags = ", ".join(session.get("tags") or session.get("topics") or [])
            summary = (
                f"Session {title} {f'by {speaker}' if speaker else ''} runs {start}-{end} "
                f"{f'in {room}' if room else ''}. Topics: {tags or 'general'}."
            ).strip()
            docs.append(
                RagDocument(
                    text=summary,
                    answer=summary,
                    source="session",
                    metadata={
                        "id": session.get("id"),
                        "title": title,
                        "speaker": speaker,
                        "start": start,
                        "end": end,
                        "room": room,
                        "topics": session.get("tags") or session.get("topics") or [],
                    },
                )
            )

        # embed if available
        if self._use_st:
            for doc in docs:
                doc.embedding = self._encode(doc.text)

        return docs

    def answer(self, query: str, documents: Iterable[RagDocument]) -> dict:
        query = query or ""
        if not query.strip():
            return {"answer": "Ask me something about the event.", "source": None, "score": 0.0, "metadata": {}}

        best_doc: RagDocument | None = None
        best_score = -1.0

        if self._use_st:
            from sentence_transformers import util  # type: ignore

            q_emb = self._encode(query)
            for doc in documents:
                if doc.embedding is None:
                    doc.embedding = self._encode(doc.text)
                score = float(util.cos_sim(q_emb, doc.embedding).item())
                if score > best_score:
                    best_score = score
                    best_doc = doc
        else:
            q_tokens = _tokenize(query)
            for doc in documents:
                score = _jaccard(q_tokens, _tokenize(doc.text))
                if score > best_score:
                    best_score = score
                    best_doc = doc

        if best_doc is None:
            return {"answer": "Sorry, I don't have information about that.", "source": None, "score": 0.0, "metadata": {}}

        return {
            "answer": best_doc.answer,
            "source": best_doc.source,
            "score": round(float(best_score), 4),
            "metadata": best_doc.metadata,
        }
