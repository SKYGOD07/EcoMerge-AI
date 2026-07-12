# EcoSphere Backend

The backend exposes the local FastAPI API for EcoSphere ESG operations.

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Modules

- auth
- dashboard
- departments
- carbon
- governance
- notifications
- reports
- AI advisory

## Auth and Roles

Seeded local users:

- admin@ecosphere.local / admin123
- manager@ecosphere.local / manager123
- employee@ecosphere.local / employee123
- auditor@ecosphere.local / auditor123

Roles are enforced through the RBAC foundation in `app/core/rbac.py`.

## Database

Start PostgreSQL from the repository root:

```bash
docker compose up -d
```

Schema and seed assets:

- `migrations/001_create_erp_schema.sql`
- `seeds/seed_erp.py`
