# Event Platform API

Advanced FastAPI backend for the Event Nexus front-end. Implements registrations, ticketing, waitlists, payments, and export utilities on MongoDB.

## Prerequisites

- Python 3.11+
- MongoDB (local or Atlas)

## Setup

```bash
cd event-platform
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Update secrets accordingly
```

## Running the API

```bash
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`.

## Organizations + Dev Auth

This backend now includes `/api/organizations` endpoints (create/list/detail/update/delete).

For development, you can authenticate requests by sending an `X-User-Id` header (no JWT required).

Example:

```bash
curl -X POST "http://localhost:8000/api/organizations" \
	-H "Content-Type: application/json" \
	-H "X-User-Id: u_dev_1" \
	-d "{\"name\":\"Acme Events\",\"slug\":\"acme\"}"
```
