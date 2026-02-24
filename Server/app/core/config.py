import os

ENV = os.getenv("ENV", "dev")
JWT_SECRET = os.getenv("JWT_SECRET", "")
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:Ss%402332253@localhost:5432/soporefix"
)
ALG = os.getenv("ALG", "HS256")
USE_HTTPS = os.getenv("USE_HTTPS", 0)
