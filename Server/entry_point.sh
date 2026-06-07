#!/usr/bin/bash
export is_using_container=${1:-0}
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload