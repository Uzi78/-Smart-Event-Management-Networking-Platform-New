"""Shared similarity routines (ported from event_ai/utils/similarity.py)."""

from __future__ import annotations

from collections.abc import Sequence

WEIGHTS = {
    "interests": 0.3,
    "skills": 0.25,
    "goals": 0.15,
    "industry": 0.1,
    "role": 0.1,
    "location": 0.1,
}

CITY_TO_REGION = {
    "lahore": "pakistan",
    "islamabad": "pakistan",
    "karachi": "pakistan",
    "dubai": "gulf",
    "doha": "gulf",
    "riyadh": "gulf",
    "london": "europe",
    "toronto": "north-america",
}

ROLE_GROUPS = {
    "vision": {"Founder", "Product Lead", "Manager", "Consultant"},
    "builder": {"Developer", "Engineer", "Researcher"},
    "analysis": {"Analyst", "Data Scientist"},
}

COMPLEMENTARY_GROUPS = {
    frozenset({"vision", "builder"}),
    frozenset({"vision", "analysis"}),
    frozenset({"builder", "analysis"}),
}


def _to_normalized_set(values: Sequence[str] | None) -> set[str]:
    if not values:
        return set()
    return {value.strip().lower() for value in values if value}


def _overlap_score(left: Sequence[str] | None, right: Sequence[str] | None) -> float:
    left_set = _to_normalized_set(left)
    right_set = _to_normalized_set(right)
    if not left_set or not right_set:
        return 0.0
    intersection = len(left_set & right_set)
    union = len(left_set | right_set)
    return intersection / union


def _role_group(role: str | None) -> str | None:
    if not role:
        return None
    for group, members in ROLE_GROUPS.items():
        if role in members:
            return group
    return None


def _role_score(role_left: str | None, role_right: str | None) -> float:
    if not role_left or not role_right:
        return 0.0
    if role_left == role_right:
        return 0.7
    group_left = _role_group(role_left)
    group_right = _role_group(role_right)
    if not group_left or not group_right:
        return 0.4
    if group_left == group_right:
        return 0.65
    if frozenset({group_left, group_right}) in COMPLEMENTARY_GROUPS:
        return 1.0
    return 0.5


def _location_score(location_left: str | None, location_right: str | None) -> float:
    if not location_left or not location_right:
        return 0.0
    norm_left = location_left.strip().lower()
    norm_right = location_right.strip().lower()
    if norm_left == norm_right:
        return 1.0
    region_left = CITY_TO_REGION.get(norm_left)
    region_right = CITY_TO_REGION.get(norm_right)
    if region_left and region_right and region_left == region_right:
        return 0.6
    return 0.0


def similarity(a: dict, b: dict) -> float:
    """Blended similarity score across interests, skills, goals, and context."""

    components = {
        "interests": _overlap_score(a.get("interests"), b.get("interests")),
        "skills": _overlap_score(a.get("skills"), b.get("skills")),
        "goals": _overlap_score(a.get("goals"), b.get("goals")),
        "industry": 1.0 if a.get("industry") and a.get("industry") == b.get("industry") else 0.0,
        "role": _role_score(a.get("role"), b.get("role")),
        "location": _location_score(a.get("location"), b.get("location")),
    }

    blended = sum(WEIGHTS[name] * components[name] for name in WEIGHTS)
    return round(blended, 3)
