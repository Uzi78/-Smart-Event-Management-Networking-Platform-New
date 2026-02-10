from __future__ import annotations

from datetime import datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_request_user_id
from app.database import get_database
from app.models.organization import Organization
from app.models.user_organization import UserOrganization, UserRole
from app.schemas.organization import OrganizationCreate, OrganizationResponse, OrganizationUpdate

router = APIRouter(prefix="/api/organizations", tags=["organizations"])


async def get_user_role(user_id: str, organization_id: str) -> UserRole | None:
    db = await get_database()
    membership = await db.user_organizations.find_one(
        {"user_id": user_id, "organization_id": organization_id}
    )
    if not membership:
        return None
    try:
        return UserRole(membership.get("role"))
    except Exception:
        return None


async def require_organization_access(user_id: str, organization_id: str) -> None:
    db = await get_database()
    membership = await db.user_organizations.find_one(
        {"user_id": user_id, "organization_id": organization_id}
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this organization",
        )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    user_id: str = Depends(get_request_user_id),
):
    db = await get_database()

    existing = await db.organizations.find_one({"slug": org_data.slug})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization slug already exists",
        )

    org = Organization(**org_data.model_dump())
    result = await db.organizations.insert_one(org.model_dump(by_alias=True, exclude={"id"}))
    org_id = str(result.inserted_id)

    membership = UserOrganization(
        user_id=user_id,
        organization_id=org_id,
        role=UserRole.ORGANIZER,
        can_create_events=True,
        can_manage_attendees=True,
        can_view_analytics=True,
        can_export_data=True,
        joined_at=datetime.utcnow(),
    )
    await db.user_organizations.insert_one(membership.model_dump(by_alias=True, exclude={"id"}))

    created = await db.organizations.find_one({"_id": result.inserted_id})
    created["_id"] = str(created["_id"])
    return {"organization": created}


@router.get("", response_model=dict)
async def get_organizations(user_id: str = Depends(get_request_user_id)):
    db = await get_database()

    memberships = await db.user_organizations.find({"user_id": user_id}).to_list(1000)
    org_ids = [ObjectId(m["organization_id"]) for m in memberships if ObjectId.is_valid(m.get("organization_id"))]

    organizations: List[dict] = []
    async for org in db.organizations.find({"_id": {"$in": org_ids}}).sort("created_at", -1):
        org["_id"] = str(org["_id"])

        event_count = await db.events.count_documents({"organization_id": org["_id"]})
        user_count = await db.user_organizations.count_documents({"organization_id": org["_id"]})

        org["_count"] = {"events": event_count, "users": user_count}
        organizations.append(org)

    return {"organizations": organizations}


@router.get("/{organization_id}", response_model=dict)
async def get_organization(
    organization_id: str,
    user_id: str = Depends(get_request_user_id),
):
    if not ObjectId.is_valid(organization_id):
        raise HTTPException(status_code=400, detail="Invalid organization id")

    await require_organization_access(user_id, organization_id)

    db = await get_database()

    organization = await db.organizations.find_one({"_id": ObjectId(organization_id)})
    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    organization["_id"] = str(organization["_id"])

    users = await db.user_organizations.find({"organization_id": organization_id}).to_list(1000)
    for u in users:
        u["_id"] = str(u["_id"])

    events = await db.events.find({"organization_id": organization_id}).sort("created_at", -1).to_list(1000)
    for e in events:
        e["_id"] = str(e["_id"])

    organization["users"] = users
    organization["events"] = events
    organization["_count"] = {"events": len(events), "users": len(users), "templates": 0}

    return {"organization": organization}


@router.patch("/{organization_id}", response_model=dict)
async def update_organization(
    organization_id: str,
    org_update: OrganizationUpdate,
    user_id: str = Depends(get_request_user_id),
):
    if not ObjectId.is_valid(organization_id):
        raise HTTPException(status_code=400, detail="Invalid organization id")

    role = await get_user_role(user_id, organization_id)
    if role not in {UserRole.SUPER_ADMIN, UserRole.ORGANIZER}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    db = await get_database()

    update_data = {k: v for k, v in org_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()

    result = await db.organizations.update_one(
        {"_id": ObjectId(organization_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    organization = await db.organizations.find_one({"_id": ObjectId(organization_id)})
    organization["_id"] = str(organization["_id"])
    return {"organization": organization}


@router.delete("/{organization_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    organization_id: str,
    user_id: str = Depends(get_request_user_id),
):
    if not ObjectId.is_valid(organization_id):
        raise HTTPException(status_code=400, detail="Invalid organization id")

    role = await get_user_role(user_id, organization_id)
    if role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    db = await get_database()
    await db.organizations.delete_one({"_id": ObjectId(organization_id)})
    await db.user_organizations.delete_many({"organization_id": organization_id})
    return None
