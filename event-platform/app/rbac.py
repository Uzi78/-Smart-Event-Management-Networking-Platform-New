from __future__ import annotations

from typing import List

from app.models.user_organization import UserRole

PERMISSIONS = {
    "CREATE_EVENT": "create_event",
    "EDIT_EVENT": "edit_event",
    "DELETE_EVENT": "delete_event",
    "PUBLISH_EVENT": "publish_event",
    "DUPLICATE_EVENT": "duplicate_event",
    "VIEW_ATTENDEES": "view_attendees",
    "MANAGE_ATTENDEES": "manage_attendees",
    "EXPORT_ATTENDEES": "export_attendees",
    "CHECK_IN_ATTENDEES": "check_in_attendees",
    "VIEW_ANALYTICS": "view_analytics",
    "VIEW_REVENUE": "view_revenue",
    "MANAGE_ORGANIZATION": "manage_organization",
    "MANAGE_USERS": "manage_users",
    "MANAGE_TEMPLATES": "manage_templates",
}

ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: list(PERMISSIONS.values()),
    UserRole.ORGANIZER: [
        PERMISSIONS["CREATE_EVENT"],
        PERMISSIONS["EDIT_EVENT"],
        PERMISSIONS["DELETE_EVENT"],
        PERMISSIONS["PUBLISH_EVENT"],
        PERMISSIONS["DUPLICATE_EVENT"],
        PERMISSIONS["VIEW_ATTENDEES"],
        PERMISSIONS["MANAGE_ATTENDEES"],
        PERMISSIONS["EXPORT_ATTENDEES"],
        PERMISSIONS["CHECK_IN_ATTENDEES"],
        PERMISSIONS["VIEW_ANALYTICS"],
        PERMISSIONS["VIEW_REVENUE"],
        PERMISSIONS["MANAGE_TEMPLATES"],
    ],
    UserRole.STAFF: [
        PERMISSIONS["VIEW_ATTENDEES"],
        PERMISSIONS["MANAGE_ATTENDEES"],
        PERMISSIONS["CHECK_IN_ATTENDEES"],
        PERMISSIONS["VIEW_ANALYTICS"],
    ],
    UserRole.ATTENDEE: [],
}


def has_permission(role: UserRole, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, [])


def has_any_permission(role: UserRole, permissions: List[str]) -> bool:
    return any(has_permission(role, perm) for perm in permissions)


def has_all_permissions(role: UserRole, permissions: List[str]) -> bool:
    return all(has_permission(role, perm) for perm in permissions)
