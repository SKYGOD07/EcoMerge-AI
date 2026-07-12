# EcoSphere Setup Guide

## Requirements

- Python 3.10+
- Node.js 18+
- Docker Compose

## Environment

Copy the root example if you want local overrides:

```bash
copy .env.example .env
```

Frontend API URL:

```bash
copy frontend\.env.example frontend\.env.local
```

Default value:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Database

```bash
docker compose up -d
```

## Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Local URLs

- Frontend: http://localhost:3001
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

## Demo Credentials

- admin@ecosphere.local / admin123
- manager@ecosphere.local / manager123
- employee@ecosphere.local / employee123
- auditor@ecosphere.local / auditor123

## One-Command Helper

After dependencies are installed, this helper starts backend and frontend:

```bash
python scripts/start_project.py
```
