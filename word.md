\# app/models.py

from datetime import datetime

from typing import Optional, List, Dict, Any

from enum import Enum

from pydantic import BaseModel, Field, EmailStr, HttpUrl

from bson import ObjectId


\# Custom ObjectId type for Pydantic

class PyObjectId(ObjectId):

`    `@classmethod

`    `def \_\_get\_validators\_\_(cls):

`        `yield cls.validate

`    `@classmethod

`    `def validate(cls, v):

`        `if not ObjectId.is\_valid(v):

`            `raise ValueError("Invalid ObjectId")

`        `return ObjectId(v)

`    `@classmethod

`    `def \_\_modify\_schema\_\_(cls, field\_schema):

`        `field\_schema.update(type="string")


\# Enums

class PlanType(str, Enum):

`    `FREE = "FREE"

`    `PRO = "PRO"

`    `ENTERPRISE = "ENTERPRISE"


class UserRole(str, Enum):

`    `SUPER\_ADMIN = "SUPER\_ADMIN"

`    `ORGANIZER = "ORGANIZER"

`    `STAFF = "STAFF"

`    `ATTENDEE = "ATTENDEE"


class EventStatus(str, Enum):

`    `DRAFT = "DRAFT"

`    `PUBLISHED = "PUBLISHED"

`    `ONGOING = "ONGOING"

`    `COMPLETED = "COMPLETED"

`    `CANCELLED = "CANCELLED"


class RegistrationStatus(str, Enum):

`    `PENDING = "PENDING"

`    `CONFIRMED = "CONFIRMED"

`    `CANCELLED = "CANCELLED"

`    `WAITLIST = "WAITLIST"

`    `REJECTED = "REJECTED"


class PaymentStatus(str, Enum):

`    `PENDING = "PENDING"

`    `COMPLETED = "COMPLETED"

`    `FAILED = "FAILED"

`    `REFUNDED = "REFUNDED"

`    `PARTIALLY\_REFUNDED = "PARTIALLY\_REFUNDED"


\# Organization Models

class OrganizationBase(BaseModel):

`    `name: str

`    `slug: str

`    `logo: Optional[str] = None

`    `email: Optional[EmailStr] = None

`    `phone: Optional[str] = None

`    `website: Optional[HttpUrl] = None

`    `description: Optional[str] = None

`    `timezone: str = "UTC"

`    `currency: str = "USD"


class OrganizationCreate(OrganizationBase):

`    `pass


class OrganizationUpdate(BaseModel):

`    `name: Optional[str] = None

`    `logo: Optional[str] = None

`    `email: Optional[EmailStr] = None

`    `phone: Optional[str] = None

`    `website: Optional[HttpUrl] = None

`    `description: Optional[str] = None

`    `timezone: Optional[str] = None

`    `currency: Optional[str] = None


class Organization(OrganizationBase):

`    `id: str = Field(alias="\_id")

`    `plan\_type: PlanType = PlanType.FREE

`    `max\_events: int = 5

`    `created\_at: datetime

`    `updated\_at: datetime

`    `class Config:

`        `populate\_by\_name = True

`        `json\_encoders = {ObjectId: str}


\# User Models

class UserBase(BaseModel):

`    `email: EmailStr

`    `name: str

`    `avatar: Optional[str] = None

`    `phone: Optional[str] = None


class UserCreate(UserBase):

`    `password: str


class UserUpdate(BaseModel):

`    `name: Optional[str] = None

`    `avatar: Optional[str] = None

`    `phone: Optional[str] = None


class User(UserBase):

`    `id: str = Field(alias="\_id")

`    `email\_verified: bool = False

`    `created\_at: datetime

`    `updated\_at: datetime

`    `last\_login\_at: Optional[datetime] = None

`    `class Config:

`        `populate\_by\_name = True

`        `json\_encoders = {ObjectId: str}


\# UserOrganization Models

class UserOrganizationBase(BaseModel):

`    `user\_id: str

`    `organization\_id: str

`    `role: UserRole = UserRole.STAFF

`    `can\_create\_events: bool = False

`    `can\_manage\_attendees: bool = False

`    `can\_view\_analytics: bool = True

`    `can\_export\_data: bool = False


class UserOrganizationCreate(UserOrganizationBase):

`    `invited\_by: Optional[str] = None


class UserOrganization(UserOrganizationBase):

`    `id: str = Field(alias="\_id")

`    `joined\_at: datetime

`    `invited\_by: Optional[str] = None

`    `class Config:

`        `populate\_by\_name = True

`        `json\_encoders = {ObjectId: str}


\# Event Models

class EventBase(BaseModel):

`    `name: str

`    `slug: str

`    `description: Optional[str] = None

`    `start\_date: datetime

`    `end\_date: datetime

`    `timezone: str = "UTC"

`    `venue: Optional[str] = None

`    `address: Optional[str] = None

`    `city: Optional[str] = None

`    `country: Optional[str] = None

`    `is\_virtual: bool = False

`    `virtual\_url: Optional[HttpUrl] = None

`    `cover\_image: Optional[str] = None

`    `logo: Optional[str] = None

`    `primary\_color: Optional[str] = None

`    `max\_attendees: Optional[int] = None

`    `registration\_open\_date: Optional[datetime] = None

`    `registration\_close\_date: Optional[datetime] = None

`    `require\_approval: bool = False


class EventCreate(EventBase):

`    `organization\_id: str

`    `template\_id: Optional[str] = None


class EventUpdate(BaseModel):

`    `name: Optional[str] = None

`    `description: Optional[str] = None

`    `start\_date: Optional[datetime] = None

`    `end\_date: Optional[datetime] = None

`    `timezone: Optional[str] = None

`    `venue: Optional[str] = None

`    `address: Optional[str] = None

`    `city: Optional[str] = None

`    `country: Optional[str] = None

`    `is\_virtual: Optional[bool] = None

`    `virtual\_url: Optional[HttpUrl] = None

`    `cover\_image: Optional[str] = None

`    `logo: Optional[str] = None

`    `primary\_color: Optional[str] = None

`    `max\_attendees: Optional[int] = None

`    `status: Optional[EventStatus] = None

`    `is\_published: Optional[bool] = None


class Event(EventBase):

`    `id: str = Field(alias="\_id")

`    `organization\_id: str

`    `created\_by\_id: str

`    `status: EventStatus = EventStatus.DRAFT

`    `is\_published: bool = False

`    `is\_template: bool = False

`    `template\_id: Optional[str] = None

`    `created\_at: datetime

`    `updated\_at: datetime

`    `published\_at: Optional[datetime] = None

`    `class Config:

`        `populate\_by\_name = True

`        `json\_encoders = {ObjectId: str}


\# TicketType Models

class TicketTypeBase(BaseModel):

`    `name: str

`    `description: Optional[str] = None

`    `price: float

`    `capacity: Optional[int] = None

`    `is\_early\_bird: bool = False

`    `early\_bird\_price: Optional[float] = None

`    `early\_bird\_ends: Optional[datetime] = None

`    `valid\_from: Optional[datetime] = None

`    `valid\_until: Optional[datetime] = None

`    `is\_active: bool = True

`    `sort\_order: int = 0


class TicketTypeCreate(TicketTypeBase):

`    `event\_id: str


class TicketTypeUpdate(BaseModel):

`    `name: Optional[str] = None

`    `description: Optional[str] = None

`    `price: Optional[float] = None

`    `capacity: Optional[int] = None

`    `is\_active: Optional[bool] = None


class TicketType(TicketTypeBase):

`    `id: str = Field(alias="\_id")

`    `event\_id: str

`    `sold\_count: int = 0

`    `reserved: int = 0

`    `created\_at: datetime

`    `updated\_at: datetime

`    `class Config:

`        `populate\_by\_name = True

`        `json\_encoders = {ObjectId: str}


\# Registration Models

class RegistrationBase(BaseModel):

`    `first\_name: str

`    `last\_name: str

`    `email: EmailStr

`    `phone: Optional[str] = None

`    `company: Optional[str] = None

`    `job\_title: Optional[str] = None

`    `custom\_fields: Optional[Dict[str, Any]] = None


class RegistrationCreate(RegistrationBase):

`    `event\_id: str

`    `ticket\_type\_id: str


class RegistrationUpdate(BaseModel):

`    `status: Optional[RegistrationStatus] = None

`    `payment\_status: Optional[PaymentStatus] = None

`    `checked\_in: Optional[bool] = None

`    `notes: Optional[str] = None


class Registration(RegistrationBase):

`    `id: str = Field(alias="\_id")

`    `event\_id: str

`    `user\_id: str

`    `ticket\_type\_id: str

`    `status: RegistrationStatus = RegistrationStatus.PENDING

`    `payment\_status: PaymentStatus = PaymentStatus.PENDING

`    `payment\_amount: float

`    `payment\_method: Optional[str] = None

`    `payment\_date: Optional[datetime] = None

`    `transaction\_id: Optional[str] = None

`    `qr\_code: str

`    `checked\_in: bool = False

`    `check\_in\_time: Optional[datetime] = None

`    `source: Optional[str] = None

`    `referral\_code: Optional[str] = None

`    `notes: Optional[str] = None

`    `created\_at: datetime

`    `updated\_at: datetime

`    `class Config:

`        `populate\_by\_name = True

`        `json\_encoders = {ObjectId: str}


\# EventTemplate Models

class EventTemplateBase(BaseModel):

`    `name: str

`    `description: Optional[str] = None

`    `category: Optional[str] = None


class EventTemplateCreate(EventTemplateBase):

`    `organization\_id: str

`    `event\_id: Optional[str] = None

`    `template\_data: Dict[str, Any]


class EventTemplate(EventTemplateBase):

`    `id: str = Field(alias="\_id")

`    `organization\_id: str

`    `template\_data: Dict[str, Any]

`    `created\_at: datetime

`    `updated\_at: datetime

`    `class Config:

`        `populate\_by\_name = True

`        `json\_encoders = {ObjectId: str}


\# Analytics Models

class TicketTypeStat(BaseModel):

`    `id: str

`    `name: str

`    `sold: int

`    `capacity: Optional[int]

`    `revenue: float

`    `remaining: Optional[int]


class RegistrationTrendPoint(BaseModel):

`    `date: str

`    `count: int


class EventAnalytics(BaseModel):

`    `event\_id: str

`    `event\_name: str

`    `total\_registrations: int

`    `confirmed\_registrations: int

`    `checked\_in: int

`    `attendance\_rate: float

`    `total\_revenue: float

`    `pending\_revenue: float

`    `registration\_trend: List[RegistrationTrendPoint]

`    `ticket\_type\_stats: List[TicketTypeStat]


class OverallStats(BaseModel):

`    `total\_events: int

`    `total\_attendees: int

`    `total\_revenue: float

`    `pending\_revenue: float

`    `average\_attendance\_rate: float


class AnalyticsResponse(BaseModel):

`    `analytics: Optional[EventAnalytics] = None

`    `overall\_stats: Optional[OverallStats] = None\
\
\# app/database.py

from motor.motor\_asyncio import AsyncIOMotorClient

from pymongo import IndexModel, ASCENDING, DESCENDING

from typing import Optional

import os


class Database:

`    `client: Optional[AsyncIOMotorClient] = None





db = Database()


async def get\_database():

`    `return db.client.event\_management


async def connect\_to\_mongo():

`    `"""Connect to MongoDB"""

`    `mongodb\_url = os.getenv("MONGODB\_URL", "mongodb://localhost:27017")

`    `db.client = AsyncIOMotorClient(mongodb\_url)



`    `# Create indexes

`    `await create\_indexes()



`    `print("Connected to MongoDB")


async def close\_mongo\_connection():

`    `"""Close MongoDB connection"""

`    `if db.client:

`        `db.client.close()

`        `print("Closed MongoDB connection")


async def create\_indexes():

`    `"""Create database indexes for optimal performance"""

`    `database = await get\_database()



`    `# Organizations indexes

`    `await database.organizations.create\_indexes([

`        `IndexModel([("slug", ASCENDING)], unique=True),

`        `IndexModel([("created\_at", DESCENDING)]),

`    `])



`    `# Users indexes

`    `await database.users.create\_indexes([

`        `IndexModel([("email", ASCENDING)], unique=True),

`        `IndexModel([("created\_at", DESCENDING)]),

`    `])



`    `# UserOrganizations indexes

`    `await database.user\_organizations.create\_indexes([

`        `IndexModel([("user\_id", ASCENDING), ("organization\_id", ASCENDING)], unique=True),

`        `IndexModel([("user\_id", ASCENDING)]),

`        `IndexModel([("organization\_id", ASCENDING)]),

`    `])



`    `# Events indexes

`    `await database.events.create\_indexes([

`        `IndexModel([("slug", ASCENDING)], unique=True),

`        `IndexModel([("organization\_id", ASCENDING)]),

`        `IndexModel([("status", ASCENDING)]),

`        `IndexModel([("created\_by\_id", ASCENDING)]),

`        `IndexModel([("start\_date", ASCENDING)]),

`        `IndexModel([("created\_at", DESCENDING)]),

`    `])



`    `# TicketTypes indexes

`    `await database.ticket\_types.create\_indexes([

`        `IndexModel([("event\_id", ASCENDING)]),

`        `IndexModel([("is\_active", ASCENDING)]),

`        `IndexModel([("sort\_order", ASCENDING)]),

`    `])



`    `# Registrations indexes

`    `await database.registrations.create\_indexes([

`        `IndexModel([("event\_id", ASCENDING), ("email", ASCENDING)], unique=True),

`        `IndexModel([("event\_id", ASCENDING)]),

`        `IndexModel([("user\_id", ASCENDING)]),

`        `IndexModel([("status", ASCENDING)]),

`        `IndexModel([("qr\_code", ASCENDING)], unique=True),

`        `IndexModel([("created\_at", DESCENDING)]),

`    `])



`    `# EventTemplates indexes

`    `await database.event\_templates.create\_indexes([

`        `IndexModel([("organization\_id", ASCENDING)]),

`        `IndexModel([("created\_at", DESCENDING)]),

`    `])


\# Collection helpers

async def get\_organizations\_collection():

`    `db = await get\_database()

`    `return db.organizations


async def get\_users\_collection():

`    `db = await get\_database()

`    `return db.users


async def get\_user\_organizations\_collection():

`    `db = await get\_database()

`    `return db.user\_organizations


async def get\_events\_collection():

`    `db = await get\_database()

`    `return db.events


async def get\_ticket\_types\_collection():

`    `db = await get\_database()

`    `return db.ticket\_types


async def get\_registrations\_collection():

`    `db = await get\_database()

`    `return db.registrations


async def get\_event\_templates\_collection():

`    `db = await get\_database()

`    `return db.event\_templates\
\
\# app/rbac.py

from typing import List

from app.models import UserRole


PERMISSIONS = {

`    `# Event permissions

`    `"CREATE\_EVENT": "create\_event",

`    `"EDIT\_EVENT": "edit\_event",

`    `"DELETE\_EVENT": "delete\_event",

`    `"PUBLISH\_EVENT": "publish\_event",

`    `"DUPLICATE\_EVENT": "duplicate\_event",



`    `# Attendee permissions

`    `"VIEW\_ATTENDEES": "view\_attendees",

`    `"MANAGE\_ATTENDEES": "manage\_attendees",

`    `"EXPORT\_ATTENDEES": "export\_attendees",

`    `"CHECK\_IN\_ATTENDEES": "check\_in\_attendees",



`    `# Analytics permissions

`    `"VIEW\_ANALYTICS": "view\_analytics",

`    `"VIEW\_REVENUE": "view\_revenue",



`    `# Organization permissions

`    `"MANAGE\_ORGANIZATION": "manage\_organization",

`    `"MANAGE\_USERS": "manage\_users",

`    `"MANAGE\_TEMPLATES": "manage\_templates",

}


ROLE\_PERMISSIONS = {

`    `UserRole.SUPER\_ADMIN: list(PERMISSIONS.values()),



`    `UserRole.ORGANIZER: [

`        `PERMISSIONS["CREATE\_EVENT"],

`        `PERMISSIONS["EDIT\_EVENT"],

`        `PERMISSIONS["DELETE\_EVENT"],

`        `PERMISSIONS["PUBLISH\_EVENT"],

`        `PERMISSIONS["DUPLICATE\_EVENT"],

`        `PERMISSIONS["VIEW\_ATTENDEES"],

`        `PERMISSIONS["MANAGE\_ATTENDEES"],

`        `PERMISSIONS["EXPORT\_ATTENDEES"],

`        `PERMISSIONS["CHECK\_IN\_ATTENDEES"],

`        `PERMISSIONS["VIEW\_ANALYTICS"],

`        `PERMISSIONS["VIEW\_REVENUE"],

`        `PERMISSIONS["MANAGE\_TEMPLATES"],

`    `],



`    `UserRole.STAFF: [

`        `PERMISSIONS["VIEW\_ATTENDEES"],

`        `PERMISSIONS["MANAGE\_ATTENDEES"],

`        `PERMISSIONS["CHECK\_IN\_ATTENDEES"],

`        `PERMISSIONS["VIEW\_ANALYTICS"],

`    `],



`    `UserRole.ATTENDEE: [],

}


def has\_permission(role: UserRole, permission: str) -> bool:

`    `"""Check if a role has a specific permission"""

`    `return permission in ROLE\_PERMISSIONS.get(role, [])


def has\_any\_permission(role: UserRole, permissions: List[str]) -> bool:

`    `"""Check if a role has any of the specified permissions"""

`    `return any(has\_permission(role, perm) for perm in permissions)


def has\_all\_permissions(role: UserRole, permissions: List[str]) -> bool:

`    `"""Check if a role has all of the specified permissions"""

`    `return all(has\_permission(role, perm) for perm in permissions)


def can\_access\_event(role: UserRole, is\_owner: bool) -> bool:

`    `"""Check if a user can access an event"""

`    `if role in [UserRole.SUPER\_ADMIN, UserRole.ORGANIZER]:

`        `return True

`    `if role == UserRole.STAFF:

`        `return True

`    `return is\_owner\
\
\# app/auth.py

from fastapi import Depends, HTTPException, status, Header

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from passlib.context import CryptContext

from jose import JWTError, jwt

from datetime import datetime, timedelta

from typing import Optional

from bson import ObjectId

import os

from app.database import get\_users\_collection, get\_user\_organizations\_collection

from app.models import UserRole

\# Password hashing

pwd\_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

\# JWT settings

SECRET\_KEY = os.getenv("SECRET\_KEY", "your-secret-key-change-this")

ALGORITHM = "HS256"

ACCESS\_TOKEN\_EXPIRE\_MINUTES = 60 \* 24 \* 7  # 7 days

security = HTTPBearer()


def verify\_password(plain\_password: str, hashed\_password: str) -> bool:

`    `"""Verify a password against its hash"""

`    `return pwd\_context.verify(plain\_password, hashed\_password)


def get\_password\_hash(password: str) -> str:

`    `"""Hash a password"""

`    `return pwd\_context.hash(password)


def create\_access\_token(data: dict, expires\_delta: Optional[timedelta] = None):

`    `"""Create a JWT access token"""

`    `to\_encode = data.copy()

`    `if expires\_delta:

`        `expire = datetime.utcnow() + expires\_delta

`    `else:

`        `expire = datetime.utcnow() + timedelta(minutes=ACCESS\_TOKEN\_EXPIRE\_MINUTES)



`    `to\_encode.update({"exp": expire})

`    `encoded\_jwt = jwt.encode(to\_encode, SECRET\_KEY, algorithm=ALGORITHM)

`    `return encoded\_jwt


async def get\_current\_user\_id(

`    `credentials: HTTPAuthorizationCredentials = Depends(security)

) -> str:

`    `"""Get current user ID from JWT token"""

`    `credentials\_exception = HTTPException(

`        `status\_code=status.HTTP\_401\_UNAUTHORIZED,

`        `detail="Could not validate credentials",

`        `headers={"WWW-Authenticate": "Bearer"},

`    `)



`    `try:

`        `token = credentials.credentials

`        `payload = jwt.decode(token, SECRET\_KEY, algorithms=[ALGORITHM])

`        `user\_id: str = payload.get("sub")

`        `if user\_id is None:

`            `raise credentials\_exception

`    `except JWTError:

`        `raise credentials\_exception



`    `users\_collection = await get\_users\_collection()

`    `user = await users\_collection.find\_one({"\_id": ObjectId(user\_id)})



`    `if user is None:

`        `raise credentials\_exception



`    `return str(user["\_id"])


async def get\_current\_user(user\_id: str = Depends(get\_current\_user\_id)):

`    `"""Get current user document"""

`    `users\_collection = await get\_users\_collection()

`    `user = await users\_collection.find\_one({"\_id": ObjectId(user\_id)})



`    `if not user:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="User not found"

`        `)



`    `return user


async def get\_user\_role(user\_id: str, organization\_id: str) -> Optional[UserRole]:

`    `"""Get user's role in an organization"""

`    `user\_orgs\_collection = await get\_user\_organizations\_collection()

`    `user\_org = await user\_orgs\_collection.find\_one({

`        `"user\_id": user\_id,

`        `"organization\_id": organization\_id

`    `})



`    `if not user\_org:

`        `return None



`    `return UserRole(user\_org["role"])


async def require\_role(

`    `user\_id: str,

`    `organization\_id: str,

`    `allowed\_roles: list[UserRole]

):

`    `"""Require user to have one of the specified roles"""

`    `role = await get\_user\_role(user\_id, organization\_id)



`    `if not role or role not in allowed\_roles:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions"

`        `)



`    `return role


async def require\_organization\_access(

`    `user\_id: str,

`    `organization\_id: str

) -> bool:

`    `"""Check if user has access to organization"""

`    `user\_orgs\_collection = await get\_user\_organizations\_collection()

`    `user\_org = await user\_orgs\_collection.find\_one({

`        `"user\_id": user\_id,

`        `"organization\_id": organization\_id

`    `})



`    `if not user\_org:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="No access to this organization"

`        `)



`    `return True


\# Simplified auth for development (using header)

async def get\_user\_id\_from\_header(x\_user\_id: Optional[str] = Header(None)) -> str:

`    `"""Get user ID from header (for development/testing)"""

`    `if not x\_user\_id:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_401\_UNAUTHORIZED,

`            `detail="User ID header required"

`        `)

`    `return x\_user\_id\
\
\# app/routers/organizations.py

from fastapi import APIRouter, HTTPException, Depends, status

from typing import List

from bson import ObjectId

from datetime import datetime

from app.models import (

`    `Organization, OrganizationCreate, OrganizationUpdate,

`    `UserRole

)

from app.database import (

`    `get\_organizations\_collection,

`    `get\_user\_organizations\_collection,

`    `get\_events\_collection

)

from app.auth import get\_current\_user\_id, get\_user\_role, require\_organization\_access

router = APIRouter(prefix="/api/organizations", tags=["organizations"])


@router.post("", response\_model=dict, status\_code=status.HTTP\_201\_CREATED)

async def create\_organization(

`    `org\_data: OrganizationCreate,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Create a new organization"""

`    `orgs\_collection = await get\_organizations\_collection()

`    `user\_orgs\_collection = await get\_user\_organizations\_collection()



`    `# Check if slug is unique

`    `existing = await orgs\_collection.find\_one({"slug": org\_data.slug})

`    `if existing:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_400\_BAD\_REQUEST,

`            `detail="Organization slug already exists"

`        `)



`    `# Create organization

`    `org\_dict = org\_data.dict()

`    `org\_dict.update({

`        `"plan\_type": "FREE",

`        `"max\_events": 5,

`        `"created\_at": datetime.utcnow(),

`        `"updated\_at": datetime.utcnow()

`    `})



`    `result = await orgs\_collection.insert\_one(org\_dict)

`    `org\_id = str(result.inserted\_id)



`    `# Add user as organizer

`    `user\_org = {

`        `"user\_id": user\_id,

`        `"organization\_id": org\_id,

`        `"role": UserRole.ORGANIZER.value,

`        `"can\_create\_events": True,

`        `"can\_manage\_attendees": True,

`        `"can\_view\_analytics": True,

`        `"can\_export\_data": True,

`        `"joined\_at": datetime.utcnow()

`    `}



`    `await user\_orgs\_collection.insert\_one(user\_org)



`    `# Get created organization

`    `organization = await orgs\_collection.find\_one({"\_id": result.inserted\_id})

`    `organization["\_id"] = str(organization["\_id"])



`    `return {"organization": organization}


@router.get("", response\_model=dict)

async def get\_organizations(

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get all organizations for current user"""

`    `user\_orgs\_collection = await get\_user\_organizations\_collection()

`    `orgs\_collection = await get\_organizations\_collection()

`    `events\_collection = await get\_events\_collection()



`    `# Get user's organization memberships

`    `user\_orgs = await user\_orgs\_collection.find({"user\_id": user\_id}).to\_list(100)

`    `org\_ids = [ObjectId(uo["organization\_id"]) for uo in user\_orgs]



`    `# Get organizations

`    `organizations = []

`    `async for org in orgs\_collection.find({"\_id": {"$in": org\_ids}}):

`        `org["\_id"] = str(org["\_id"])



`        `# Get counts

`        `event\_count = await events\_collection.count\_documents(

`            `{"organization\_id": org["\_id"]}

`        `)

`        `user\_count = await user\_orgs\_collection.count\_documents(

`            `{"organization\_id": org["\_id"]}

`        `)



`        `org["\_count"] = {

`            `"events": event\_count,

`            `"users": user\_count

`        `}



`        `organizations.append(org)



`    `return {"organizations": organizations}


@router.get("/{organization\_id}", response\_model=dict)

async def get\_organization(

`    `organization\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get organization details"""

`    `await require\_organization\_access(user\_id, organization\_id)



`    `orgs\_collection = await get\_organizations\_collection()

`    `user\_orgs\_collection = await get\_user\_organizations\_collection()

`    `events\_collection = await get\_events\_collection()



`    `# Get organization

`    `organization = await orgs\_collection.find\_one({"\_id": ObjectId(organization\_id)})

`    `if not organization:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Organization not found"

`        `)



`    `organization["\_id"] = str(organization["\_id"])



`    `# Get users

`    `users = []

`    `async for user\_org in user\_orgs\_collection.find({"organization\_id": organization\_id}):

`        `user\_org["\_id"] = str(user\_org["\_id"])

`        `users.append(user\_org)



`    `organization["users"] = users



`    `# Get events

`    `events = []

`    `async for event in events\_collection.find({"organization\_id": organization\_id}).sort("created\_at", -1):

`        `event["\_id"] = str(event["\_id"])

`        `events.append(event)



`    `organization["events"] = events



`    `# Get counts

`    `organization["\_count"] = {

`        `"events": len(events),

`        `"users": len(users),

`        `"templates": 0  # Will add template count if needed

`    `}



`    `return {"organization": organization}


@router.patch("/{organization\_id}", response\_model=dict)

async def update\_organization(

`    `organization\_id: str,

`    `org\_update: OrganizationUpdate,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Update organization"""

`    `# Check permissions

`    `role = await get\_user\_role(user\_id, organization\_id)

`    `if not role or role not in [UserRole.SUPER\_ADMIN, UserRole.ORGANIZER]:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions"

`        `)



`    `orgs\_collection = await get\_organizations\_collection()



`    `# Update organization

`    `update\_data = {k: v for k, v in org\_update.dict().items() if v is not None}

`    `update\_data["updated\_at"] = datetime.utcnow()



`    `result = await orgs\_collection.update\_one(

`        `{"\_id": ObjectId(organization\_id)},

`        `{"$set": update\_data}

`    `)



`    `if result.matched\_count == 0:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Organization not found"

`        `)



`    `# Get updated organization

`    `organization = await orgs\_collection.find\_one({"\_id": ObjectId(organization\_id)})

`    `organization["\_id"] = str(organization["\_id"])



`    `return {"organization": organization}


@router.delete("/{organization\_id}", status\_code=status.HTTP\_204\_NO\_CONTENT)

async def delete\_organization(

`    `organization\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Delete organization"""

`    `# Check permissions

`    `role = await get\_user\_role(user\_id, organization\_id)

`    `if not role or role != UserRole.SUPER\_ADMIN:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Only super admins can delete organizations"

`        `)



`    `orgs\_collection = await get\_organizations\_collection()

`    `events\_collection = await get\_events\_collection()

`    `user\_orgs\_collection = await get\_user\_organizations\_collection()



`    `# Delete organization and related data

`    `await orgs\_collection.delete\_one({"\_id": ObjectId(organization\_id)})

`    `await events\_collection.delete\_many({"organization\_id": organization\_id})

`    `await user\_orgs\_collection.delete\_many({"organization\_id": organization\_id})



`    `return None\
\
\# app/routers/events.py

from fastapi import APIRouter, HTTPException, Depends, status, Query

from typing import List, Optional

from bson import ObjectId

from datetime import datetime

from app.models import (

`    `Event, EventCreate, EventUpdate, EventStatus, UserRole

)

from app.database import (

`    `get\_events\_collection,

`    `get\_organizations\_collection,

`    `get\_ticket\_types\_collection,

`    `get\_registrations\_collection,

`    `get\_event\_templates\_collection,

`    `get\_user\_organizations\_collection

)

from app.auth import get\_current\_user\_id, get\_user\_role

from app.rbac import has\_permission, PERMISSIONS

router = APIRouter(prefix="/api/events", tags=["events"])


@router.post("", response\_model=dict, status\_code=status.HTTP\_201\_CREATED)

async def create\_event(

`    `event\_data: EventCreate,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Create a new event"""

`    `events\_collection = await get\_events\_collection()

`    `templates\_collection = await get\_event\_templates\_collection()

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, event\_data.organization\_id)

`    `if not role or not has\_permission(role, PERMISSIONS["CREATE\_EVENT"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to create events"

`        `)



`    `# Check if slug is unique

`    `existing = await events\_collection.find\_one({"slug": event\_data.slug})

`    `if existing:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_400\_BAD\_REQUEST,

`            `detail="Event slug already exists"

`        `)



`    `# Create event

`    `event\_dict = event\_data.dict()

`    `event\_dict.update({

`        `"created\_by\_id": user\_id,

`        `"status": EventStatus.DRAFT.value,

`        `"is\_published": False,

`        `"is\_template": False,

`        `"created\_at": datetime.utcnow(),

`        `"updated\_at": datetime.utcnow()

`    `})



`    `result = await events\_collection.insert\_one(event\_dict)

`    `event\_id = str(result.inserted\_id)



`    `# If creating from template, create ticket types

`    `if event\_data.template\_id:

`        `template = await templates\_collection.find\_one(

`            `{"\_id": ObjectId(event\_data.template\_id)}

`        `)

`        `if template and "ticket\_types" in template.get("template\_data", {}):

`            `ticket\_types = template["template\_data"]["ticket\_types"]

`            `for ticket in ticket\_types:

`                `ticket\_dict = {

`                    `"event\_id": event\_id,

`                    `"name": ticket["name"],

`                    `"description": ticket.get("description"),

`                    `"price": float(ticket["price"]),

`                    `"capacity": ticket.get("capacity"),

`                    `"is\_early\_bird": ticket.get("is\_early\_bird", False),

`                    `"early\_bird\_price": float(ticket["early\_bird\_price"]) if ticket.get("early\_bird\_price") else None,

`                    `"sort\_order": ticket.get("sort\_order", 0),

`                    `"is\_active": True,

`                    `"sold\_count": 0,

`                    `"reserved": 0,

`                    `"created\_at": datetime.utcnow(),

`                    `"updated\_at": datetime.utcnow()

`                `}

`                `await ticket\_types\_collection.insert\_one(ticket\_dict)



`    `# Get created event with relations

`    `event = await get\_event\_with\_details(event\_id)



`    `return {"event": event}


@router.get("", response\_model=dict)

async def get\_events(

`    `organization\_id: Optional[str] = Query(None),

`    `status: Optional[str] = Query(None),

`    `search: Optional[str] = Query(None),

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get events"""

`    `events\_collection = await get\_events\_collection()

`    `user\_orgs\_collection = await get\_user\_organizations\_collection()



`    `# Build query

`    `query = {}



`    `if organization\_id:

`        `# Check user has access to organization

`        `role = await get\_user\_role(user\_id, organization\_id)

`        `if not role:

`            `raise HTTPException(

`                `status\_code=status.HTTP\_403\_FORBIDDEN,

`                `detail="No access to this organization"

`            `)

`        `query["organization\_id"] = organization\_id

`    `else:

`        `# Get all events from user's organizations

`        `user\_orgs = await user\_orgs\_collection.find({"user\_id": user\_id}).to\_list(100)

`        `org\_ids = [uo["organization\_id"] for uo in user\_orgs]

`        `query["organization\_id"] = {"$in": org\_ids}



`    `if status:

`        `query["status"] = status



`    `if search:

`        `query["$or"] = [

`            `{"name": {"$regex": search, "$options": "i"}},

`            `{"description": {"$regex": search, "$options": "i"}},

`            `{"venue": {"$regex": search, "$options": "i"}}

`        `]



`    `# Get events

`    `events = []

`    `async for event in events\_collection.find(query).sort("created\_at", -1):

`        `event\_details = await get\_event\_with\_details(str(event["\_id"]))

`        `events.append(event\_details)



`    `return {"events": events}


@router.get("/{event\_id}", response\_model=dict)

async def get\_event(

`    `event\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get event by ID"""

`    `events\_collection = await get\_events\_collection()



`    `event = await events\_collection.find\_one({"\_id": ObjectId(event\_id)})

`    `if not event:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Event not found"

`        `)



`    `# Check access

`    `role = await get\_user\_role(user\_id, event["organization\_id"])

`    `if not role:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="No access to this event"

`        `)



`    `event\_details = await get\_event\_with\_details(event\_id)

`    `return {"event": event\_details}


@router.patch("/{event\_id}", response\_model=dict)

async def update\_event(

`    `event\_id: str,

`    `event\_update: EventUpdate,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Update event"""

`    `events\_collection = await get\_events\_collection()



`    `# Get event

`    `event = await events\_collection.find\_one({"\_id": ObjectId(event\_id)})

`    `if not event:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Event not found"

`        `)



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, event["organization\_id"])

`    `if not role or not has\_permission(role, PERMISSIONS["EDIT\_EVENT"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to edit events"

`        `)



`    `# Update event

`    `update\_data = {k: v for k, v in event\_update.dict().items() if v is not None}

`    `update\_data["updated\_at"] = datetime.utcnow()



`    `if event\_update.is\_published and not event.get("is\_published"):

`        `update\_data["published\_at"] = datetime.utcnow()



`    `await events\_collection.update\_one(

`        `{"\_id": ObjectId(event\_id)},

`        `{"$set": update\_data}

`    `)



`    `# Get updated event

`    `event\_details = await get\_event\_with\_details(event\_id)

`    `return {"event": event\_details}


@router.delete("/{event\_id}", status\_code=status.HTTP\_204\_NO\_CONTENT)

async def delete\_event(

`    `event\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Delete event"""

`    `events\_collection = await get\_events\_collection()

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()

`    `registrations\_collection = await get\_registrations\_collection()



`    `# Get event

`    `event = await events\_collection.find\_one({"\_id": ObjectId(event\_id)})

`    `if not event:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Event not found"

`        `)



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, event["organization\_id"])

`    `if not role or not has\_permission(role, PERMISSIONS["DELETE\_EVENT"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to delete events"

`        `)



`    `# Delete event and related data

`    `await events\_collection.delete\_one({"\_id": ObjectId(event\_id)})

`    `await ticket\_types\_collection.delete\_many({"event\_id": event\_id})

`    `await registrations\_collection.delete\_many({"event\_id": event\_id})



`    `return None


@router.post("/{event\_id}/duplicate", response\_model=dict, status\_code=status.HTTP\_201\_CREATED)

async def duplicate\_event(

`    `event\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Duplicate an event"""

`    `events\_collection = await get\_events\_collection()

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()



`    `# Get original event

`    `original\_event = await events\_collection.find\_one({"\_id": ObjectId(event\_id)})

`    `if not original\_event:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Event not found"

`        `)



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, original\_event["organization\_id"])

`    `if not role or not has\_permission(role, PERMISSIONS["DUPLICATE\_EVENT"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to duplicate events"

`        `)



`    `# Generate new slug

`    `base\_slug = f"{original\_event['slug']}-copy"

`    `new\_slug = base\_slug

`    `counter = 1



`    `while await events\_collection.find\_one({"slug": new\_slug}):

`        `new\_slug = f"{base\_slug}-{counter}"

`        `counter += 1



`    `# Create duplicated event

`    `duplicated\_event = original\_event.copy()

`    `duplicated\_event.pop("\_id")

`    `duplicated\_event.update({

`        `"name": f"{original\_event['name']} (Copy)",

`        `"slug": new\_slug,

`        `"status": EventStatus.DRAFT.value,

`        `"is\_published": False,

`        `"created\_by\_id": user\_id,

`        `"created\_at": datetime.utcnow(),

`        `"updated\_at": datetime.utcnow(),

`        `"published\_at": None

`    `})



`    `result = await events\_collection.insert\_one(duplicated\_event)

`    `new\_event\_id = str(result.inserted\_id)



`    `# Duplicate ticket types

`    `async for ticket in ticket\_types\_collection.find({"event\_id": event\_id}):

`        `ticket\_copy = ticket.copy()

`        `ticket\_copy.pop("\_id")

`        `ticket\_copy.update({

`            `"event\_id": new\_event\_id,

`            `"sold\_count": 0,

`            `"reserved": 0,

`            `"created\_at": datetime.utcnow(),

`            `"updated\_at": datetime.utcnow()

`        `})

`        `await ticket\_types\_collection.insert\_one(ticket\_copy)



`    `# Get duplicated event with details

`    `event\_details = await get\_event\_with\_details(new\_event\_id)

`    `return {"event": event\_details}


async def get\_event\_with\_details(event\_id: str):

`    `"""Helper function to get event with related data"""

`    `events\_collection = await get\_events\_collection()

`    `orgs\_collection = await get\_organizations\_collection()

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()

`    `registrations\_collection = await get\_registrations\_collection()



`    `event = await events\_collection.find\_one({"\_id": ObjectId(event\_id)})

`    `if not event:

`        `return None



`    `event["\_id"] = str(event["\_id"])



`    `# Get organization

`    `org = await orgs\_collection.find\_one({"\_id": ObjectId(event["organization\_id"])})

`    `if org:

`        `org["\_id"] = str(org["\_id"])

`        `event["organization"] = {

`            `"id": org["\_id"],

`            `"name": org["name"],

`            `"slug": org["slug"],

`            `"logo": org.get("logo")

`        `}



`    `# Get ticket types

`    `ticket\_types = []

`    `async for ticket in ticket\_types\_collection.find({"event\_id": event\_id, "is\_active": True}):

`        `ticket["\_id"] = str(ticket["\_id"])

`        `ticket\_types.append(ticket)



`    `event["ticket\_types"] = ticket\_types



`    `# Get registration count

`    `registration\_count = await registrations\_collection.count\_documents({"event\_id": event\_id})

`    `event["\_count"] = {"registrations": registration\_count}



`    `return event\
\
\# app/routers/templates.py

from fastapi import APIRouter, HTTPException, Depends, status, Query

from typing import Optional

from bson import ObjectId

from datetime import datetime

from app.models import EventTemplate, EventTemplateCreate, UserRole

from app.database import (

`    `get\_event\_templates\_collection,

`    `get\_events\_collection,

`    `get\_ticket\_types\_collection

)

from app.auth import get\_current\_user\_id, get\_user\_role

from app.rbac import has\_permission, PERMISSIONS

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.post("", response\_model=dict, status\_code=status.HTTP\_201\_CREATED)

async def create\_template(

`    `template\_data: EventTemplateCreate,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Create a new event template"""

`    `templates\_collection = await get\_event\_templates\_collection()

`    `events\_collection = await get\_events\_collection()

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, template\_data.organization\_id)

`    `if not role or not has\_permission(role, PERMISSIONS["MANAGE\_TEMPLATES"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to manage templates"

`        `)



`    `template\_dict = template\_data.dict()



`    `# If creating from event, load event data

`    `if template\_data.event\_id:

`        `event = await events\_collection.find\_one({"\_id": ObjectId(template\_data.event\_id)})

`        `if not event:

`            `raise HTTPException(

`                `status\_code=status.HTTP\_404\_NOT\_FOUND,

`                `detail="Event not found"

`            `)



`        `# Get ticket types

`        `ticket\_types = []

`        `async for ticket in ticket\_types\_collection.find({"event\_id": template\_data.event\_id}):

`            `ticket\_types.append({

`                `"name": ticket["name"],

`                `"description": ticket.get("description"),

`                `"price": str(ticket["price"]),

`                `"capacity": ticket.get("capacity"),

`                `"is\_early\_bird": ticket.get("is\_early\_bird", False),

`                `"early\_bird\_price": str(ticket["early\_bird\_price"]) if ticket.get("early\_bird\_price") else None,

`                `"sort\_order": ticket.get("sort\_order", 0)

`            `})



`        `template\_dict["template\_data"] = {

`            `"description": event.get("description"),

`            `"venue": event.get("venue"),

`            `"is\_virtual": event.get("is\_virtual", False),

`            `"max\_attendees": event.get("max\_attendees"),

`            `"require\_approval": event.get("require\_approval", False),

`            `"cover\_image": event.get("cover\_image"),

`            `"logo": event.get("logo"),

`            `"primary\_color": event.get("primary\_color"),

`            `"ticket\_types": ticket\_types

`        `}



`    `# Create template

`    `template\_dict.update({

`        `"created\_at": datetime.utcnow(),

`        `"updated\_at": datetime.utcnow()

`    `})



`    `# Remove event\_id as it's not stored in the template

`    `template\_dict.pop("event\_id", None)



`    `result = await templates\_collection.insert\_one(template\_dict)



`    `# Get created template

`    `template = await templates\_collection.find\_one({"\_id": result.inserted\_id})

`    `template["\_id"] = str(template["\_id"])



`    `return {"template": template}


@router.get("", response\_model=dict)

async def get\_templates(

`    `organization\_id: str = Query(...),

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get all templates for an organization"""

`    `templates\_collection = await get\_event\_templates\_collection()



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, organization\_id)

`    `if not role:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="No access to this organization"

`        `)



`    `# Get templates

`    `templates = []

`    `async for template in templates\_collection.find({"organization\_id": organization\_id}).sort("created\_at", -1):

`        `template["\_id"] = str(template["\_id"])

`        `templates.append(template)



`    `return {"templates": templates}


@router.get("/{template\_id}", response\_model=dict)

async def get\_template(

`    `template\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get template by ID"""

`    `templates\_collection = await get\_event\_templates\_collection()



`    `template = await templates\_collection.find\_one({"\_id": ObjectId(template\_id)})

`    `if not template:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Template not found"

`        `)



`    `# Check access

`    `role = await get\_user\_role(user\_id, template["organization\_id"])

`    `if not role:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="No access to this template"

`        `)



`    `template["\_id"] = str(template["\_id"])

`    `return {"template": template}


@router.delete("/{template\_id}", status\_code=status.HTTP\_204\_NO\_CONTENT)

async def delete\_template(

`    `template\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Delete template"""

`    `templates\_collection = await get\_event\_templates\_collection()



`    `# Get template

`    `template = await templates\_collection.find\_one({"\_id": ObjectId(template\_id)})

`    `if not template:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Template not found"

`        `)



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, template["organization\_id"])

`    `if not role or not has\_permission(role, PERMISSIONS["MANAGE\_TEMPLATES"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to delete templates"

`        `)



`    `await templates\_collection.delete\_one({"\_id": ObjectId(template\_id)})



`    `return None\
\
\# app/routers/analytics.py

from fastapi import APIRouter, HTTPException, Depends, status, Query

from typing import Optional

from bson import ObjectId

from datetime import datetime, timedelta

from app.models import (

`    `AnalyticsResponse, EventAnalytics, OverallStats,

`    `TicketTypeStat, RegistrationTrendPoint

)

from app.database import (

`    `get\_events\_collection,

`    `get\_registrations\_collection,

`    `get\_ticket\_types\_collection

)

from app.auth import get\_current\_user\_id, get\_user\_role

from app.rbac import has\_permission, PERMISSIONS

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard", response\_model=AnalyticsResponse)

async def get\_analytics\_dashboard(

`    `organization\_id: str = Query(...),

`    `event\_id: Optional[str] = Query(None),

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get analytics dashboard data"""



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, organization\_id)

`    `if not role or not has\_permission(role, PERMISSIONS["VIEW\_ANALYTICS"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to view analytics"

`        `)



`    `events\_collection = await get\_events\_collection()

`    `registrations\_collection = await get\_registrations\_collection()

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()



`    `# Build query

`    `query = {"organization\_id": organization\_id}

`    `if event\_id:

`        `query["\_id"] = ObjectId(event\_id)



`    `# Get events

`    `events = await events\_collection.find(query).to\_list(1000)



`    `if not events:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="No events found"

`        `)



`    `# Calculate analytics for each event

`    `analytics\_list = []



`    `for event in events:

`        `event\_id\_str = str(event["\_id"])



`        `# Get all registrations for this event

`        `registrations = await registrations\_collection.find(

`            `{"event\_id": event\_id\_str}

`        `).to\_list(10000)



`        `total\_registrations = len(registrations)

`        `confirmed\_registrations = len([r for r in registrations if r["status"] == "CONFIRMED"])

`        `checked\_in = len([r for r in registrations if r.get("checked\_in", False)])



`        `# Calculate revenue

`        `total\_revenue = sum(

`            `float(r["payment\_amount"])

`            `for r in registrations

`            `if r["payment\_status"] == "COMPLETED"

`        `)



`        `pending\_revenue = sum(

`            `float(r["payment\_amount"])

`            `for r in registrations

`            `if r["payment\_status"] == "PENDING"

`        `)



`        `# Registration trend (last 30 days)

`        `thirty\_days\_ago = datetime.utcnow() - timedelta(days=30)

`        `registration\_trend = []



`        `for i in range(30):

`            `date = thirty\_days\_ago + timedelta(days=i)

`            `date\_str = date.strftime("%Y-%m-%d")



`            `count = len([

`                `r for r in registrations

`                `if r["created\_at"].strftime("%Y-%m-%d") == date\_str

`            `])



`            `registration\_trend.append(

`                `RegistrationTrendPoint(date=date\_str, count=count)

`            `)



`        `# Ticket type breakdown

`        `ticket\_types = await ticket\_types\_collection.find(

`            `{"event\_id": event\_id\_str}

`        `).to\_list(100)



`        `ticket\_type\_stats = []

`        `for ticket in ticket\_types:

`            `ticket\_id = str(ticket["\_id"])



`            `sold = len([r for r in registrations if r["ticket\_type\_id"] == ticket\_id])



`            `revenue = sum(

`                `float(r["payment\_amount"])

`                `for r in registrations

`                `if r["ticket\_type\_id"] == ticket\_id and r["payment\_status"] == "COMPLETED"

`            `)



`            `remaining = None

`            `if ticket.get("capacity"):

`                `remaining = ticket["capacity"] - sold



`            `ticket\_type\_stats.append(

`                `TicketTypeStat(

`                    `id=ticket\_id,

`                    `name=ticket["name"],

`                    `sold=sold,

`                    `capacity=ticket.get("capacity"),

`                    `revenue=revenue,

`                    `remaining=remaining

`                `)

`            `)



`        `# Calculate attendance rate

`        `attendance\_rate = 0.0

`        `if total\_registrations > 0:

`            `attendance\_rate = (checked\_in / total\_registrations) \* 100



`        `event\_analytics = EventAnalytics(

`            `event\_id=event\_id\_str,

`            `event\_name=event["name"],

`            `total\_registrations=total\_registrations,

`            `confirmed\_registrations=confirmed\_registrations,

`            `checked\_in=checked\_in,

`            `attendance\_rate=round(attendance\_rate, 2),

`            `total\_revenue=total\_revenue,

`            `pending\_revenue=pending\_revenue,

`            `registration\_trend=registration\_trend,

`            `ticket\_type\_stats=ticket\_type\_stats

`        `)



`        `analytics\_list.append(event\_analytics)



`    `# If single event, return that event's analytics

`    `if event\_id:

`        `return AnalyticsResponse(analytics=analytics\_list[0])



`    `# Calculate overall organization stats

`    `total\_events = len(events)

`    `total\_attendees = sum(a.total\_registrations for a in analytics\_list)

`    `total\_org\_revenue = sum(a.total\_revenue for a in analytics\_list)

`    `pending\_org\_revenue = sum(a.pending\_revenue for a in analytics\_list)



`    `average\_attendance\_rate = 0.0

`    `if analytics\_list:

`        `average\_attendance\_rate = sum(a.attendance\_rate for a in analytics\_list) / len(analytics\_list)



`    `overall\_stats = OverallStats(

`        `total\_events=total\_events,

`        `total\_attendees=total\_attendees,

`        `total\_revenue=total\_org\_revenue,

`        `pending\_revenue=pending\_org\_revenue,

`        `average\_attendance\_rate=round(average\_attendance\_rate, 2)

`    `)



`    `return AnalyticsResponse(overall\_stats=overall\_stats)


@router.get("/event/{event\_id}", response\_model=dict)

async def get\_event\_analytics(

`    `event\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get detailed analytics for a specific event"""

`    `events\_collection = await get\_events\_collection()

`    `registrations\_collection = await get\_registrations\_collection()



`    `# Get event

`    `event = await events\_collection.find\_one({"\_id": ObjectId(event\_id)})

`    `if not event:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Event not found"

`        `)



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, event["organization\_id"])

`    `if not role or not has\_permission(role, PERMISSIONS["VIEW\_ANALYTICS"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to view analytics"

`        `)



`    `# Get registrations

`    `registrations = await registrations\_collection.find(

`        `{"event\_id": event\_id}

`    `).to\_list(10000)



`    `# Calculate various metrics

`    `status\_breakdown = {}

`    `payment\_status\_breakdown = {}

`    `source\_breakdown = {}



`    `for reg in registrations:

`        `# Status breakdown

`        `status = reg.get("status", "PENDING")

`        `status\_breakdown[status] = status\_breakdown.get(status, 0) + 1



`        `# Payment status breakdown

`        `payment\_status = reg.get("payment\_status", "PENDING")

`        `payment\_status\_breakdown[payment\_status] = payment\_status\_breakdown.get(payment\_status, 0) + 1



`        `# Source breakdown

`        `source = reg.get("source", "unknown")

`        `source\_breakdown[source] = source\_breakdown.get(source, 0) + 1



`    `# Check-in stats by hour (for events in progress or completed)

`    `checkin\_by\_hour = {}

`    `for reg in registrations:

`        `if reg.get("check\_in\_time"):

`            `hour = reg["check\_in\_time"].hour

`            `checkin\_by\_hour[hour] = checkin\_by\_hour.get(hour, 0) + 1



`    `return {

`        `"event\_id": event\_id,

`        `"event\_name": event["name"],

`        `"total\_registrations": len(registrations),

`        `"status\_breakdown": status\_breakdown,

`        `"payment\_status\_breakdown": payment\_status\_breakdown,

`        `"source\_breakdown": source\_breakdown,

`        `"checkin\_by\_hour": checkin\_by\_hour

`    `}


@router.get("/revenue/{organization\_id}", response\_model=dict)

async def get\_revenue\_analytics(

`    `organization\_id: str,

`    `start\_date: Optional[str] = Query(None),

`    `end\_date: Optional[str] = Query(None),

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get revenue analytics"""



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, organization\_id)

`    `if not role or not has\_permission(role, PERMISSIONS["VIEW\_REVENUE"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to view revenue"

`        `)



`    `events\_collection = await get\_events\_collection()

`    `registrations\_collection = await get\_registrations\_collection()



`    `# Get events

`    `event\_query = {"organization\_id": organization\_id}

`    `if start\_date and end\_date:

`        `event\_query["start\_date"] = {

`            `"$gte": datetime.fromisoformat(start\_date),

`            `"$lte": datetime.fromisoformat(end\_date)

`        `}



`    `events = await events\_collection.find(event\_query).to\_list(1000)

`    `event\_ids = [str(e["\_id"]) for e in events]



`    `# Get all registrations

`    `registrations = await registrations\_collection.find(

`        `{"event\_id": {"$in": event\_ids}}

`    `).to\_list(100000)



`    `# Calculate revenue metrics

`    `total\_revenue = sum(

`        `float(r["payment\_amount"])

`        `for r in registrations

`        `if r["payment\_status"] == "COMPLETED"

`    `)



`    `pending\_revenue = sum(

`        `float(r["payment\_amount"])

`        `for r in registrations

`        `if r["payment\_status"] == "PENDING"

`    `)



`    `refunded\_revenue = sum(

`        `float(r["payment\_amount"])

`        `for r in registrations

`        `if r["payment\_status"] in ["REFUNDED", "PARTIALLY\_REFUNDED"]

`    `)



`    `# Revenue by event

`    `revenue\_by\_event = {}

`    `for event in events:

`        `event\_id = str(event["\_id"])

`        `event\_regs = [r for r in registrations if r["event\_id"] == event\_id]



`        `event\_revenue = sum(

`            `float(r["payment\_amount"])

`            `for r in event\_regs

`            `if r["payment\_status"] == "COMPLETED"

`        `)



`        `revenue\_by\_event[event["name"]] = event\_revenue



`    `# Revenue trend (by month)

`    `revenue\_by\_month = {}

`    `for reg in registrations:

`        `if reg["payment\_status"] == "COMPLETED" and reg.get("payment\_date"):

`            `month = reg["payment\_date"].strftime("%Y-%m")

`            `revenue\_by\_month[month] = revenue\_by\_month.get(month, 0) + float(reg["payment\_amount"])



`    `return {

`        `"total\_revenue": total\_revenue,

`        `"pending\_revenue": pending\_revenue,

`        `"refunded\_revenue": refunded\_revenue,

`        `"revenue\_by\_event": revenue\_by\_event,

`        `"revenue\_by\_month": revenue\_by\_month,

`        `"total\_transactions": len(registrations)

`    `}\
\
\# app/routers/registrations.py

from fastapi import APIRouter, HTTPException, Depends, status, Query

from typing import Optional

from bson import ObjectId

from datetime import datetime

import secrets

import string

from app.models import (

`    `Registration, RegistrationCreate, RegistrationUpdate,

`    `RegistrationStatus, PaymentStatus

)

from app.database import (

`    `get\_registrations\_collection,

`    `get\_events\_collection,

`    `get\_ticket\_types\_collection

)

from app.auth import get\_current\_user\_id, get\_user\_role

from app.rbac import has\_permission, PERMISSIONS

router = APIRouter(prefix="/api/registrations", tags=["registrations"])


def generate\_qr\_code() -> str:

`    `"""Generate a unique QR code string"""

`    `alphabet = string.ascii\_letters + string.digits

`    `return ''.join(secrets.choice(alphabet) for \_ in range(16))


@router.post("", response\_model=dict, status\_code=status.HTTP\_201\_CREATED)

async def create\_registration(

`    `reg\_data: RegistrationCreate,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Create a new registration"""

`    `registrations\_collection = await get\_registrations\_collection()

`    `events\_collection = await get\_events\_collection()

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()



`    `# Get event

`    `event = await events\_collection.find\_one({"\_id": ObjectId(reg\_data.event\_id)})

`    `if not event:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Event not found"

`        `)



`    `# Get ticket type

`    `ticket\_type = await ticket\_types\_collection.find\_one({"\_id": ObjectId(reg\_data.ticket\_type\_id)})

`    `if not ticket\_type:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Ticket type not found"

`        `)



`    `# Check capacity

`    `if ticket\_type.get("capacity"):

`        `sold\_count = ticket\_type.get("sold\_count", 0)

`        `if sold\_count >= ticket\_type["capacity"]:

`            `raise HTTPException(

`                `status\_code=status.HTTP\_400\_BAD\_REQUEST,

`                `detail="Ticket type sold out"

`            `)



`    `# Check if user already registered for this event

`    `existing = await registrations\_collection.find\_one({

`        `"event\_id": reg\_data.event\_id,

`        `"email": reg\_data.email

`    `})



`    `if existing:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_400\_BAD\_REQUEST,

`            `detail="Email already registered for this event"

`        `)



`    `# Calculate payment amount (check early bird)

`    `payment\_amount = ticket\_type["price"]

`    `if ticket\_type.get("is\_early\_bird") and ticket\_type.get("early\_bird\_price"):

`        `if ticket\_type.get("early\_bird\_ends"):

`            `if datetime.utcnow() < ticket\_type["early\_bird\_ends"]:

`                `payment\_amount = ticket\_type["early\_bird\_price"]



`    `# Generate QR code

`    `qr\_code = generate\_qr\_code()

`    `while await registrations\_collection.find\_one({"qr\_code": qr\_code}):

`        `qr\_code = generate\_qr\_code()



`    `# Create registration

`    `reg\_dict = reg\_data.dict()

`    `reg\_dict.update({

`        `"user\_id": user\_id,

`        `"status": RegistrationStatus.PENDING.value,

`        `"payment\_status": PaymentStatus.PENDING.value,

`        `"payment\_amount": float(payment\_amount),

`        `"qr\_code": qr\_code,

`        `"checked\_in": False,

`        `"created\_at": datetime.utcnow(),

`        `"updated\_at": datetime.utcnow()

`    `})



`    `result = await registrations\_collection.insert\_one(reg\_dict)



`    `# Update ticket sold count

`    `await ticket\_types\_collection.update\_one(

`        `{"\_id": ObjectId(reg\_data.ticket\_type\_id)},

`        `{"$inc": {"sold\_count": 1}}

`    `)



`    `# Get created registration

`    `registration = await registrations\_collection.find\_one({"\_id": result.inserted\_id})

`    `registration["\_id"] = str(registration["\_id"])



`    `return {"registration": registration}


@router.get("", response\_model=dict)

async def get\_registrations(

`    `event\_id: Optional[str] = Query(None),

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get registrations"""

`    `registrations\_collection = await get\_registrations\_collection()

`    `events\_collection = await get\_events\_collection()



`    `query = {}



`    `if event\_id:

`        `# Get event to check permissions

`        `event = await events\_collection.find\_one({"\_id": ObjectId(event\_id)})

`        `if not event:

`            `raise HTTPException(

`                `status\_code=status.HTTP\_404\_NOT\_FOUND,

`                `detail="Event not found"

`            `)



`        `# Check permissions

`        `role = await get\_user\_role(user\_id, event["organization\_id"])

`        `if not role or not has\_permission(role, PERMISSIONS["VIEW\_ATTENDEES"]):

`            `raise HTTPException(

`                `status\_code=status.HTTP\_403\_FORBIDDEN,

`                `detail="Insufficient permissions to view attendees"

`            `)



`        `query["event\_id"] = event\_id

`    `else:

`        `# Get user's own registrations

`        `query["user\_id"] = user\_id



`    `# Get registrations

`    `registrations = []

`    `async for reg in registrations\_collection.find(query).sort("created\_at", -1):

`        `reg["\_id"] = str(reg["\_id"])

`        `registrations.append(reg)



`    `return {"registrations": registrations}


@router.get("/{registration\_id}", response\_model=dict)

async def get\_registration(

`    `registration\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Get registration by ID"""

`    `registrations\_collection = await get\_registrations\_collection()

`    `events\_collection = await get\_events\_collection()



`    `registration = await registrations\_collection.find\_one({"\_id": ObjectId(registration\_id)})

`    `if not registration:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Registration not found"

`        `)



`    `# Check access (own registration or has permission)

`    `if registration["user\_id"] != user\_id:

`        `event = await events\_collection.find\_one({"\_id": ObjectId(registration["event\_id"])})

`        `if event:

`            `role = await get\_user\_role(user\_id, event["organization\_id"])

`            `if not role or not has\_permission(role, PERMISSIONS["VIEW\_ATTENDEES"]):

`                `raise HTTPException(

`                    `status\_code=status.HTTP\_403\_FORBIDDEN,

`                    `detail="No access to this registration"

`                `)



`    `registration["\_id"] = str(registration["\_id"])

`    `return {"registration": registration}


@router.patch("/{registration\_id}", response\_model=dict)

async def update\_registration(

`    `registration\_id: str,

`    `reg\_update: RegistrationUpdate,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Update registration"""

`    `registrations\_collection = await get\_registrations\_collection()

`    `events\_collection = await get\_events\_collection()



`    `# Get registration

`    `registration = await registrations\_collection.find\_one({"\_id": ObjectId(registration\_id)})

`    `if not registration:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Registration not found"

`        `)



`    `# Check permissions

`    `event = await events\_collection.find\_one({"\_id": ObjectId(registration["event\_id"])})

`    `if event:

`        `role = await get\_user\_role(user\_id, event["organization\_id"])

`        `if not role or not has\_permission(role, PERMISSIONS["MANAGE\_ATTENDEES"]):

`            `raise HTTPException(

`                `status\_code=status.HTTP\_403\_FORBIDDEN,

`                `detail="Insufficient permissions to manage attendees"

`            `)



`    `# Update registration

`    `update\_data = {k: v for k, v in reg\_update.dict().items() if v is not None}

`    `update\_data["updated\_at"] = datetime.utcnow()



`    `# If checking in, set check-in time

`    `if reg\_update.checked\_in and not registration.get("checked\_in"):

`        `update\_data["check\_in\_time"] = datetime.utcnow()



`    `await registrations\_collection.update\_one(

`        `{"\_id": ObjectId(registration\_id)},

`        `{"$set": update\_data}

`    `)



`    `# Get updated registration

`    `registration = await registrations\_collection.find\_one({"\_id": ObjectId(registration\_id)})

`    `registration["\_id"] = str(registration["\_id"])



`    `return {"registration": registration}


@router.post("/{registration\_id}/check-in", response\_model=dict)

async def check\_in\_registration(

`    `registration\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Check in a registration"""

`    `registrations\_collection = await get\_registrations\_collection()

`    `events\_collection = await get\_events\_collection()



`    `# Get registration

`    `registration = await registrations\_collection.find\_one({"\_id": ObjectId(registration\_id)})

`    `if not registration:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Registration not found"

`        `)



`    `# Check permissions

`    `event = await events\_collection.find\_one({"\_id": ObjectId(registration["event\_id"])})

`    `if event:

`        `role = await get\_user\_role(user\_id, event["organization\_id"])

`        `if not role or not has\_permission(role, PERMISSIONS["CHECK\_IN\_ATTENDEES"]):

`            `raise HTTPException(

`                `status\_code=status.HTTP\_403\_FORBIDDEN,

`                `detail="Insufficient permissions to check in attendees"

`            `)



`    `# Check if already checked in

`    `if registration.get("checked\_in"):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_400\_BAD\_REQUEST,

`            `detail="Already checked in"

`        `)



`    `# Update registration

`    `await registrations\_collection.update\_one(

`        `{"\_id": ObjectId(registration\_id)},

`        `{

`            `"$set": {

`                `"checked\_in": True,

`                `"check\_in\_time": datetime.utcnow(),

`                `"updated\_at": datetime.utcnow()

`            `}

`        `}

`    `)



`    `# Get updated registration

`    `registration = await registrations\_collection.find\_one({"\_id": ObjectId(registration\_id)})

`    `registration["\_id"] = str(registration["\_id"])



`    `return {"registration": registration}


@router.post("/qr-check-in", response\_model=dict)

async def qr\_check\_in(

`    `qr\_code: str = Query(...),

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Check in using QR code"""

`    `registrations\_collection = await get\_registrations\_collection()

`    `events\_collection = await get\_events\_collection()



`    `# Get registration by QR code

`    `registration = await registrations\_collection.find\_one({"qr\_code": qr\_code})

`    `if not registration:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Invalid QR code"

`        `)



`    `# Check permissions

`    `event = await events\_collection.find\_one({"\_id": ObjectId(registration["event\_id"])})

`    `if event:

`        `role = await get\_user\_role(user\_id, event["organization\_id"])

`        `if not role or not has\_permission(role, PERMISSIONS["CHECK\_IN\_ATTENDEES"]):

`            `raise HTTPException(

`                `status\_code=status.HTTP\_403\_FORBIDDEN,

`                `detail="Insufficient permissions to check in attendees"

`            `)



`    `# Check if already checked in

`    `if registration.get("checked\_in"):

`        `return {

`            `"registration": registration,

`            `"message": "Already checked in",

`            `"already\_checked\_in": True

`        `}



`    `# Update registration

`    `await registrations\_collection.update\_one(

`        `{"\_id": registration["\_id"]},

`        `{

`            `"$set": {

`                `"checked\_in": True,

`                `"check\_in\_time": datetime.utcnow(),

`                `"updated\_at": datetime.utcnow()

`            `}

`        `}

`    `)



`    `# Get updated registration

`    `registration = await registrations\_collection.find\_one({"\_id": registration["\_id"]})

`    `registration["\_id"] = str(registration["\_id"])



`    `return {

`        `"registration": registration,

`        `"message": "Successfully checked in",

`        `"already\_checked\_in": False

`    `}


@router.delete("/{registration\_id}", status\_code=status.HTTP\_204\_NO\_CONTENT)

async def cancel\_registration(

`    `registration\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Cancel registration"""

`    `registrations\_collection = await get\_registrations\_collection()

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()



`    `# Get registration

`    `registration = await registrations\_collection.find\_one({"\_id": ObjectId(registration\_id)})

`    `if not registration:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Registration not found"

`        `)



`    `# Check if user owns this registration

`    `if registration["user\_id"] != user\_id:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Cannot cancel someone else's registration"

`        `)



`    `# Update status to cancelled

`    `await registrations\_collection.update\_one(

`        `{"\_id": ObjectId(registration\_id)},

`        `{

`            `"$set": {

`                `"status": RegistrationStatus.CANCELLED.value,

`                `"updated\_at": datetime.utcnow()

`            `}

`        `}

`    `)



`    `# Decrease ticket sold count

`    `await ticket\_types\_collection.update\_one(

`        `{"\_id": ObjectId(registration["ticket\_type\_id"])},

`        `{"$inc": {"sold\_count": -1}}

`    `)



`    `return None\
\
\# app/main.py

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from app.database import connect\_to\_mongo, close\_mongo\_connection

from app.routers import (

`    `auth,

`    `organizations,

`    `events,

`    `templates,

`    `analytics,

`    `registrations,

`    `ticket\_types

)


@asynccontextmanager

async def lifespan(app: FastAPI):

`    `# Startup

`    `await connect\_to\_mongo()

`    `yield

`    `# Shutdown

`    `await close\_mongo\_connection()


app = FastAPI(

`    `title="Event Management System",

`    `description="Multi-tenant event management platform with analytics",

`    `version="1.0.0",

`    `lifespan=lifespan

)

\# CORS middleware

app.add\_middleware(

`    `CORSMiddleware,

`    `allow\_origins=["\*"],  # Configure appropriately for production

`    `allow\_credentials=True,

`    `allow\_methods=["\*"],

`    `allow\_headers=["\*"],

)

\# Include routers

app.include\_router(auth.router)

app.include\_router(organizations.router)

app.include\_router(events.router)

app.include\_router(templates.router)

app.include\_router(analytics.router)

app.include\_router(registrations.router)

app.include\_router(ticket\_types.router)


@app.get("/")

async def root():

`    `return {

`        `"message": "Event Management System API",

`        `"version": "1.0.0",

`        `"docs": "/docs"

`    `}


@app.get("/health")

async def health\_check():

`    `return {"status": "healthy"}\
\
\# app/routers/ticket\_types.py

from fastapi import APIRouter, HTTPException, Depends, status

from typing import List

from bson import ObjectId

from datetime import datetime

from app.models import TicketType, TicketTypeCreate, TicketTypeUpdate, UserRole

from app.database import (

`    `get\_ticket\_types\_collection,

`    `get\_events\_collection

)

from app.auth import get\_current\_user\_id, get\_user\_role

from app.rbac import has\_permission, PERMISSIONS

router = APIRouter(prefix="/api/ticket-types", tags=["ticket-types"])


@router.post("", response\_model=dict, status\_code=status.HTTP\_201\_CREATED)

async def create\_ticket\_type(

`    `ticket\_data: TicketTypeCreate,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Create a new ticket type"""

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()

`    `events\_collection = await get\_events\_collection()



`    `# Get event

`    `event = await events\_collection.find\_one({"\_id": ObjectId(ticket\_data.event\_id)})

`    `if not event:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Event not found"

`        `)



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, event["organization\_id"])

`    `if not role or not has\_permission(role, PERMISSIONS["EDIT\_EVENT"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to create ticket types"

`        `)



`    `# Create ticket type

`    `ticket\_dict = ticket\_data.dict()

`    `ticket\_dict.update({

`        `"sold\_count": 0,

`        `"reserved": 0,

`        `"created\_at": datetime.utcnow(),

`        `"updated\_at": datetime.utcnow()

`    `})



`    `result = await ticket\_types\_collection.insert\_one(ticket\_dict)



`    `# Get created ticket type

`    `ticket\_type = await ticket\_types\_collection.find\_one({"\_id": result.inserted\_id})

`    `ticket\_type["\_id"] = str(ticket\_type["\_id"])



`    `return {"ticket\_type": ticket\_type}


@router.get("/event/{event\_id}", response\_model=dict)

async def get\_ticket\_types\_for\_event(event\_id: str):

`    `"""Get all ticket types for an event"""

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()



`    `ticket\_types = []

`    `async for ticket in ticket\_types\_collection.find({"event\_id": event\_id}).sort("sort\_order", 1):

`        `ticket["\_id"] = str(ticket["\_id"])

`        `ticket\_types.append(ticket)



`    `return {"ticket\_types": ticket\_types}


@router.get("/{ticket\_type\_id}", response\_model=dict)

async def get\_ticket\_type(ticket\_type\_id: str):

`    `"""Get ticket type by ID"""

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()



`    `ticket\_type = await ticket\_types\_collection.find\_one({"\_id": ObjectId(ticket\_type\_id)})

`    `if not ticket\_type:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Ticket type not found"

`        `)



`    `ticket\_type["\_id"] = str(ticket\_type["\_id"])

`    `return {"ticket\_type": ticket\_type}


@router.patch("/{ticket\_type\_id}", response\_model=dict)

async def update\_ticket\_type(

`    `ticket\_type\_id: str,

`    `ticket\_update: TicketTypeUpdate,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Update ticket type"""

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()

`    `events\_collection = await get\_events\_collection()



`    `# Get ticket type

`    `ticket\_type = await ticket\_types\_collection.find\_one({"\_id": ObjectId(ticket\_type\_id)})

`    `if not ticket\_type:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Ticket type not found"

`        `)



`    `# Get event

`    `event = await events\_collection.find\_one({"\_id": ObjectId(ticket\_type["event\_id"])})

`    `if not event:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Event not found"

`        `)



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, event["organization\_id"])

`    `if not role or not has\_permission(role, PERMISSIONS["EDIT\_EVENT"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to update ticket types"

`        `)



`    `# Update ticket type

`    `update\_data = {k: v for k, v in ticket\_update.dict().items() if v is not None}

`    `update\_data["updated\_at"] = datetime.utcnow()



`    `await ticket\_types\_collection.update\_one(

`        `{"\_id": ObjectId(ticket\_type\_id)},

`        `{"$set": update\_data}

`    `)



`    `# Get updated ticket type

`    `ticket\_type = await ticket\_types\_collection.find\_one({"\_id": ObjectId(ticket\_type\_id)})

`    `ticket\_type["\_id"] = str(ticket\_type["\_id"])



`    `return {"ticket\_type": ticket\_type}


@router.delete("/{ticket\_type\_id}", status\_code=status.HTTP\_204\_NO\_CONTENT)

async def delete\_ticket\_type(

`    `ticket\_type\_id: str,

`    `user\_id: str = Depends(get\_current\_user\_id)

):

`    `"""Delete ticket type"""

`    `ticket\_types\_collection = await get\_ticket\_types\_collection()

`    `events\_collection = await get\_events\_collection()



`    `# Get ticket type

`    `ticket\_type = await ticket\_types\_collection.find\_one({"\_id": ObjectId(ticket\_type\_id)})

`    `if not ticket\_type:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Ticket type not found"

`        `)



`    `# Get event

`    `event = await events\_collection.find\_one({"\_id": ObjectId(ticket\_type["event\_id"])})

`    `if not event:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_404\_NOT\_FOUND,

`            `detail="Event not found"

`        `)



`    `# Check permissions

`    `role = await get\_user\_role(user\_id, event["organization\_id"])

`    `if not role or not has\_permission(role, PERMISSIONS["EDIT\_EVENT"]):

`        `raise HTTPException(

`            `status\_code=status.HTTP\_403\_FORBIDDEN,

`            `detail="Insufficient permissions to delete ticket types"

`        `)



`    `# Check if any tickets have been sold

`    `if ticket\_type.get("sold\_count", 0) > 0:

`        `raise HTTPException(

`            `status\_code=status.HTTP\_400\_BAD\_REQUEST,

`            `detail="Cannot delete ticket type with sold tickets"

`        `)



`    `await ticket\_types\_collection.delete\_one({"\_id": ObjectId(ticket\_type\_id)})



`    `return None

# app/routers/\_\_init\_\_.py

from . import (

`    `auth,

`    `organizations,

`    `events,

`    `templates,

`    `analytics,

`    `registrations,

`    `ticket\_types

)\
\
\# app/\_\_init\_\_.py\
\
\# app/main.py

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from app.database import connect\_to\_mongo, close\_mongo\_connection

from app.routers import (

`    `auth,

`    `organizations,

`    `events,

`    `templates,

`    `analytics,

`    `registrations,

`    `ticket\_types

)


@asynccontextmanager

async def lifespan(app: FastAPI):

`    `# Startup

`    `await connect\_to\_mongo()

`    `yield

`    `# Shutdown

`    `await close\_mongo\_connection()


app = FastAPI(

`    `title="Event Management System",

`    `description="Multi-tenant event management platform with analytics",

`    `version="1.0.0",

`    `lifespan=lifespan

)

\# CORS middleware

app.add\_middleware(

`    `CORSMiddleware,

`    `allow\_origins=["\*"],  # Configure appropriately for production

`    `allow\_credentials=True,

`    `allow\_methods=["\*"],

`    `allow\_headers=["\*"],

)

\# Include routers

app.include\_router(auth.router)

app.include\_router(organizations.router)

app.include\_router(events.router)

app.include\_router(templates.router)

app.include\_router(analytics.router)

app.include\_router(registrations.router)

app.include\_router(ticket\_types.router)


@app.get("/")

async def root():

`    `return {

`        `"message": "Event Management System API",

`        `"version": "1.0.0",

`        `"docs": "/docs"

`    `}


@app.get("/health")

async def health\_check():

`    `return {"status": "healthy"}\
\
**API Documentation**

**Base URL**

http://localhost:8000

**Authentication**

All protected endpoints require a Bearer token in the Authorization header:

Authorization: Bearer <your\_jwt\_token>

-----
**Authentication Endpoints**

**Register User**

POST /api/auth/register

**Request Body:**

{

`  `"email": "user@example.com",

`  `"name": "John Doe",

`  `"password": "securepassword123",

`  `"phone": "+1234567890",

`  `"avatar": "https://example.com/avatar.jpg"

}

**Response (201):**

{

`  `"user": {

`    `"\_id": "user\_id",

`    `"email": "user@example.com",

`    `"name": "John Doe",

`    `"email\_verified": false,

`    `"created\_at": "2024-02-10T12:00:00Z"

`  `},

`  `"access\_token": "eyJhbGciOiJIUzI1NiIs...",

`  `"token\_type": "bearer"

}

**Login**

POST /api/auth/login?email=user@example.com&password=password123

**Response (200):**

{

`  `"user": {...},

`  `"access\_token": "eyJhbGciOiJIUzI1NiIs...",

`  `"token\_type": "bearer"

}

**Get Current User**

GET /api/auth/me

Authorization: Bearer <token>

**Response (200):**

{

`  `"user": {

`    `"\_id": "user\_id",

`    `"email": "user@example.com",

`    `"name": "John Doe"

`  `}

}

-----
**Organization Endpoints**

**Create Organization**

POST /api/organizations

Authorization: Bearer <token>

**Request Body:**

{

`  `"name": "Tech Conference Inc",

`  `"slug": "tech-conf",

`  `"email": "info@techconf.com",

`  `"phone": "+1234567890",

`  `"website": "https://techconf.com",

`  `"description": "Leading tech conference organizer"

}

**Response (201):**

{

`  `"organization": {

`    `"\_id": "org\_id",

`    `"name": "Tech Conference Inc",

`    `"slug": "tech-conf",

`    `"plan\_type": "FREE",

`    `"max\_events": 5,

`    `"created\_at": "2024-02-10T12:00:00Z"

`  `}

}

**List Organizations**

GET /api/organizations

Authorization: Bearer <token>

**Response (200):**

{

`  `"organizations": [

`    `{

`      `"\_id": "org\_id",

`      `"name": "Tech Conference Inc",

`      `"slug": "tech-conf",

`      `"\_count": {

`        `"events": 5,

`        `"users": 3

`      `}

`    `}

`  `]

}

**Get Organization**

GET /api/organizations/{organization\_id}

Authorization: Bearer <token>

**Update Organization**

PATCH /api/organizations/{organization\_id}

Authorization: Bearer <token>

**Request Body:**

{

`  `"name": "Updated Name",

`  `"description": "Updated description"

}

-----
**Event Endpoints**

**Create Event**

POST /api/events

Authorization: Bearer <token>

**Request Body:**

{

`  `"name": "Annual Tech Summit 2024",

`  `"slug": "tech-summit-2024",

`  `"description": "The biggest tech conference of the year",

`  `"start\_date": "2024-12-01T09:00:00Z",

`  `"end\_date": "2024-12-03T18:00:00Z",

`  `"timezone": "America/New\_York",

`  `"organization\_id": "org\_id",

`  `"venue": "Convention Center",

`  `"address": "123 Main St",

`  `"city": "San Francisco",

`  `"country": "USA",

`  `"is\_virtual": false,

`  `"max\_attendees": 1000,

`  `"registration\_open\_date": "2024-10-01T00:00:00Z",

`  `"registration\_close\_date": "2024-11-25T23:59:59Z",

`  `"require\_approval": false

}

**Response (201):**

{

`  `"event": {

`    `"\_id": "event\_id",

`    `"name": "Annual Tech Summit 2024",

`    `"slug": "tech-summit-2024",

`    `"status": "DRAFT",

`    `"is\_published": false,

`    `"organization": {

`      `"id": "org\_id",

`      `"name": "Tech Conference Inc"

`    `},

`    `"ticket\_types": [],

`    `"\_count": {

`      `"registrations": 0

`    `}

`  `}

}

**List Events**

GET /api/events?organization\_id=org\_id&status=PUBLISHED&search=summit

Authorization: Bearer <token>

**Query Parameters:**

- organization\_id (optional): Filter by organization
- status (optional): DRAFT, PUBLISHED, ONGOING, COMPLETED, CANCELLED
- search (optional): Search in name, description, venue

**Get Event**

GET /api/events/{event\_id}

Authorization: Bearer <token>

**Update Event**

PATCH /api/events/{event\_id}

Authorization: Bearer <token>

**Request Body:**

{

`  `"status": "PUBLISHED",

`  `"is\_published": true

}

**Duplicate Event**

POST /api/events/{event\_id}/duplicate

Authorization: Bearer <token>

**Response (201):**

{

`  `"event": {

`    `"\_id": "new\_event\_id",

`    `"name": "Annual Tech Summit 2024 (Copy)",

`    `"slug": "tech-summit-2024-copy",

`    `"status": "DRAFT"

`  `}

}

-----
**Ticket Type Endpoints**

**Create Ticket Type**

POST /api/ticket-types

Authorization: Bearer <token>

**Request Body:**

{

`  `"event\_id": "event\_id",

`  `"name": "Early Bird",

`  `"description": "Limited early bird pricing",

`  `"price": 299.99,

`  `"capacity": 100,

`  `"is\_early\_bird": true,

`  `"early\_bird\_price": 199.99,

`  `"early\_bird\_ends": "2024-11-01T23:59:59Z",

`  `"valid\_from": "2024-10-01T00:00:00Z",

`  `"valid\_until": "2024-11-30T23:59:59Z",

`  `"is\_active": true,

`  `"sort\_order": 1

}

**Get Event Ticket Types**

GET /api/ticket-types/event/{event\_id}

**Response (200):**

{

`  `"ticket\_types": [

`    `{

`      `"\_id": "ticket\_type\_id",

`      `"event\_id": "event\_id",

`      `"name": "Early Bird",

`      `"price": 299.99,

`      `"capacity": 100,

`      `"sold\_count": 45,

`      `"is\_active": true

`    `}

`  `]

}

-----
**Registration Endpoints**

**Create Registration**

POST /api/registrations

Authorization: Bearer <token>

**Request Body:**

{

`  `"event\_id": "event\_id",

`  `"ticket\_type\_id": "ticket\_type\_id",

`  `"first\_name": "Jane",

`  `"last\_name": "Smith",

`  `"email": "jane@example.com",

`  `"phone": "+1234567890",

`  `"company": "Tech Corp",

`  `"job\_title": "Software Engineer",

`  `"custom\_fields": {

`    `"dietary\_restrictions": "Vegetarian",

`    `"t\_shirt\_size": "M"

`  `}

}

**Response (201):**

{

`  `"registration": {

`    `"\_id": "registration\_id",

`    `"event\_id": "event\_id",

`    `"status": "PENDING",

`    `"payment\_status": "PENDING",

`    `"payment\_amount": 199.99,

`    `"qr\_code": "ABC123XYZ789",

`    `"checked\_in": false,

`    `"created\_at": "2024-02-10T12:00:00Z"

`  `}

}

**List Registrations**

GET /api/registrations?event\_id=event\_id

Authorization: Bearer <token>

**Update Registration**

PATCH /api/registrations/{registration\_id}

Authorization: Bearer <token>

**Request Body:**

{

`  `"status": "CONFIRMED",

`  `"payment\_status": "COMPLETED"

}

**Check-in Attendee**

POST /api/registrations/{registration\_id}/check-in

Authorization: Bearer <token>

**QR Code Check-in**

POST /api/registrations/qr-check-in?qr\_code=ABC123XYZ789

Authorization: Bearer <token>

**Response (200):**

{

`  `"registration": {...},

`  `"message": "Successfully checked in",

`  `"already\_checked\_in": false

}

**Cancel Registration**

DELETE /api/registrations/{registration\_id}

Authorization: Bearer <token>

-----
**Template Endpoints**

**Create Template**

POST /api/templates

Authorization: Bearer <token>

**Request Body (from scratch):**

{

`  `"name": "Standard Conference Template",

`  `"description": "Template for standard tech conferences",

`  `"category": "Conference",

`  `"organization\_id": "org\_id",

`  `"template\_data": {

`    `"description": "Default conference description",

`    `"max\_attendees": 500,

`    `"ticket\_types": [

`      `{

`        `"name": "General Admission",

`        `"price": "299.99",

`        `"capacity": 400

`      `}

`    `]

`  `}

}

**Request Body (from event):**

{

`  `"name": "Tech Summit Template",

`  `"organization\_id": "org\_id",

`  `"event\_id": "event\_id"

}

**List Templates**

GET /api/templates?organization\_id=org\_id

Authorization: Bearer <token>

-----
**Analytics Endpoints**

**Get Dashboard Analytics**

GET /api/analytics/dashboard?organization\_id=org\_id&event\_id=event\_id

Authorization: Bearer <token>

**Query Parameters:**

- organization\_id (required): Organization ID
- event\_id (optional): Specific event ID (if omitted, returns org-wide stats)

**Response (200) - Single Event:**

{

`  `"analytics": {

`    `"event\_id": "event\_id",

`    `"event\_name": "Tech Summit 2024",

`    `"total\_registrations": 250,

`    `"confirmed\_registrations": 230,

`    `"checked\_in": 200,

`    `"attendance\_rate": 80.0,

`    `"total\_revenue": 59975.00,

`    `"pending\_revenue": 1999.50,

`    `"registration\_trend": [

`      `{"date": "2024-01-15", "count": 5},

`      `{"date": "2024-01-16", "count": 12}

`    `],

`    `"ticket\_type\_stats": [

`      `{

`        `"id": "ticket\_type\_id",

`        `"name": "Early Bird",

`        `"sold": 150,

`        `"capacity": 200,

`        `"revenue": 29985.00,

`        `"remaining": 50

`      `}

`    `]

`  `}

}

**Response (200) - Organization Wide:**

{

`  `"overall\_stats": {

`    `"total\_events": 5,

`    `"total\_attendees": 1250,

`    `"total\_revenue": 299875.00,

`    `"pending\_revenue": 5000.00,

`    `"average\_attendance\_rate": 85.5

`  `}

}

**Get Event Analytics**

GET /api/analytics/event/{event\_id}

Authorization: Bearer <token>

**Response (200):**

{

`  `"event\_id": "event\_id",

`  `"event\_name": "Tech Summit 2024",

`  `"total\_registrations": 250,

`  `"status\_breakdown": {

`    `"CONFIRMED": 230,

`    `"PENDING": 15,

`    `"CANCELLED": 5

`  `},

`  `"payment\_status\_breakdown": {

`    `"COMPLETED": 235,

`    `"PENDING": 10,

`    `"FAILED": 5

`  `},

`  `"source\_breakdown": {

`    `"web": 200,

`    `"mobile": 40,

`    `"api": 10

`  `},

`  `"checkin\_by\_hour": {

`    `"8": 20,

`    `"9": 80,

`    `"10": 60,

`    `"11": 40

`  `}

}

**Get Revenue Analytics**

GET /api/analytics/revenue/{organization\_id}?start\_date=2024-01-01T00:00:00Z&end\_date=2024-12-31T23:59:59Z

Authorization: Bearer <token>

**Response (200):**

{

`  `"total\_revenue": 299875.00,

`  `"pending\_revenue": 5000.00,

`  `"refunded\_revenue": 1500.00,

`  `"revenue\_by\_event": {

`    `"Tech Summit 2024": 150000.00,

`    `"Developer Conference": 100000.00

`  `},

`  `"revenue\_by\_month": {

`    `"2024-01": 50000.00,

`    `"2024-02": 75000.00,

`    `"2024-03": 60000.00

`  `},

`  `"total\_transactions": 1250

}

-----
**Error Responses**

**400 Bad Request**

{

`  `"detail": "Validation error message"

}

**401 Unauthorized**

{

`  `"detail": "Could not validate credentials"

}

**403 Forbidden**

{

`  `"detail": "Insufficient permissions"

}

**404 Not Found**

{

`  `"detail": "Resource not found"

}

**500 Internal Server Error**

{

`  `"detail": "Internal server error"

}

-----
**Pagination**

For endpoints returning lists, you can add pagination (to be implemented):

GET /api/events?page=1&limit=20

-----
**Rate Limiting**

API rate limits (to be implemented):

- Authenticated requests: 1000/hour
- Unauthenticated requests: 100/hour
-----
**Webhooks (Future Feature)**

Subscribe to events:

- event.created
- event.published
- registration.created
- registration.confirmed
- attendee.checked\_in

