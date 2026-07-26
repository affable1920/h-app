#!/usr/bin/bash
alembic upgrade head
exec python -m app.main