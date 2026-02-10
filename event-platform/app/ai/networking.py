"""AI networking recommendations (ported from event_ai/ai/recommender.py)."""

from __future__ import annotations

from collections.abc import Sequence

from .similarity import similarity


def recommend_connections(
    subject: dict,
    attendees: Sequence[dict],
    *,
    limit: int = 3,
    min_score: float = 0.0,
) -> list[dict]:
    """Suggest the strongest attendee matches along with human-readable reasons."""

    matches: list[dict] = []
    for candidate in attendees:
        if candidate is subject or candidate.get("id") == subject.get("id"):
            continue

        score = similarity(subject, candidate)
        if score < min_score:
            continue

        overlap = _collect_overlap(subject, candidate)
        reason = _reason_from_overlap(subject, candidate, overlap, score)
        matches.append(
            {
                "match": candidate,
                "score": score,
                "reason": reason,
                "overlap": overlap,
            }
        )

    matches.sort(key=lambda entry: entry["score"], reverse=True)
    return matches[:limit]


def _collect_overlap(subject: dict, candidate: dict) -> dict[str, list[str]]:
    overlap: dict[str, list[str]] = {}
    for key in ("interests", "skills", "goals"):
        subject_values = set(subject.get(key, []) or [])
        candidate_values = set(candidate.get(key, []) or [])
        overlap[key] = sorted(subject_values & candidate_values)
    return overlap


def _format_list(values: Sequence[str]) -> str:
    cleaned = [value for value in values if value]
    if not cleaned:
        return ""
    if len(cleaned) == 1:
        return cleaned[0]
    return ", ".join(cleaned[:-1]) + f" and {cleaned[-1]}"


def _reason_from_overlap(subject: dict, candidate: dict, overlap: dict[str, list[str]], score: float) -> str:
    fragments: list[str] = []
    if overlap["skills"]:
        fragments.append(f"shared hands-on skills in {_format_list(overlap['skills'])}")
    if overlap["interests"]:
        fragments.append(f"both curious about {_format_list(overlap['interests'])}")
    if overlap["goals"]:
        fragments.append(f"aligned goals around {_format_list(overlap['goals'])}")
    if subject.get("industry") and subject.get("industry") == candidate.get("industry"):
        fragments.append(f"operating in {subject['industry']}")
    if subject.get("location") and subject.get("location") == candidate.get("location"):
        fragments.append(f"already nearby in {subject['location']}")

    if not fragments:
        fragments.append("complementary strengths even without direct overlap")

    candidate_blurb = candidate.get("name", "This attendee")
    role = candidate.get("role")
    role_note = f" ({role})" if role else ""
    return f"{candidate_blurb}{role_note}: {'; '.join(fragments)}. Match score {score:.2f}."


def conversation_starter(subject: dict, candidate: dict, overlap: dict[str, list[str]]) -> str:
    if overlap.get("interests"):
        topic = overlap["interests"][0]
        return f"What’s your take on {topic} this year?"
    if overlap.get("skills"):
        skill = overlap["skills"][0]
        return f"What’s a project where you used {skill} recently?"
    if overlap.get("goals"):
        goal = overlap["goals"][0]
        return f"How are you approaching {goal} right now?"
    return "What brought you to this event, and what are you hoping to learn?"
