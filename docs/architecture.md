# EcoSphere Architecture

EcoSphere is a local-first ESG ERP application. The architecture keeps the user interface, API layer, business logic, and database responsibilities separate so the hackathon demo can stay clear and extendable.

## Runtime Shape

- `frontend/`: Next.js dashboard for login, ESG KPIs, department views, carbon tracking, CSR, governance, rewards, reports, alerts, and admin settings.
- `backend/app/api/routes/`: FastAPI route modules grouped by business capability.
- `backend/app/controllers/`: request orchestration.
- `backend/app/services/`: business logic and mock/demo service responses.
- `backend/app/core/`: JWT, RBAC, and configuration.
- `backend/migrations/`: PostgreSQL schema baseline.

## Local Services

- PostgreSQL runs locally through Docker Compose.
- FastAPI runs on `http://localhost:8000`.
- Next.js runs on `http://localhost:3001`.
- The frontend reads `NEXT_PUBLIC_API_BASE_URL` and falls back to demo data if the API is offline.

## Security

JWT authentication and RBAC are built around four roles:

- `admin`: users, settings, and master data
- `manager`: department workflows and reporting
- `employee`: ESG action entry and policy acknowledgement
- `auditor`: governance, evidence, and compliance review

## AI Boundary

EcoSphere may include AI recommendations, but the product is not an AI demo. AI should read operational records and suggest next actions while the ERP workflows remain the primary experience.
