# EcoSphere

EcoSphere is a local-first ERP-style ESG management platform for the Odoo Hackathon. It turns ESG work into operational workflows: departments, users, carbon entries, CSR activity, governance policies, audits, rewards, notifications, and reports.

The repo is now centered on a FastAPI backend, local PostgreSQL, JWT authentication, role-based access control, and a Next.js dashboard frontend. AI is only an advisory layer on top of recorded business data.

## Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, shadcn-style primitives, Recharts
- Backend: FastAPI, Pydantic, SQLAlchemy-ready structure, JWT auth, RBAC
- Database: local PostgreSQL through Docker Compose

## Run Locally

```bash
docker compose up -d
```

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

Open:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Demo Users

- admin@ecosphere.local / admin123
- manager@ecosphere.local / manager123
- employee@ecosphere.local / employee123
- auditor@ecosphere.local / auditor123

## Repository Layout

- `frontend/` - EcoSphere dashboard and workflow UI
- `backend/app/` - FastAPI routes, controllers, services, models, security, and RBAC
- `backend/migrations/` - PostgreSQL schema baseline
- `backend/seeds/` - local seed data
- `docs/` - architecture, setup, API, database, UI, roadmap, and legacy notes

## Documentation

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API](docs/api.md)
- [Feature Mapping](docs/feature-mapping.md)
- [UI Screens](docs/ui-screens.md)
- [Setup](docs/setup.md)
- [Roadmap](docs/roadmap.md)
- [Legacy Notes](docs/legacy.md)
