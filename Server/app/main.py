from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.models import Doctor
from app.database.entry import get_db
from app.services.data_generator import seed_db
from app.routes import auth, clinics, doctors
from app.services.openapi_spec import generate_openapi_spec
from sqlalchemy.orm import Session


async def create():
    db: Session = next(get_db())

    doctor = Doctor(
        username="Doctor A",
        password="Ss@2332253",
        credentials="MMBS - DM | MD",
        primary_specialization="Pulmonology",
        secondary_specializations=[],
        fullname="DOCTORA",
        experience=10,
        rating=4.4,
        reviews=100,
        clinics=[],
        schedules=[],
        email="user@domain.com",
        verified=True,
        base_fee=100,
        consults_online=True,
    )

    try:
        db.add(doctor)

        db.commit()
        db.refresh(doctor)

    except Exception as e:
        print(e)
        raise e


@asynccontextmanager
async def root(app: FastAPI):
    print("Starting up")

    from app.database.entry import Base, engine

    Base.metadata.create_all(engine)
    app.openapi_schema = generate_openapi_spec(app)  # Generate schema once

    # await main()

    # await create()

    yield
    print("Shutting down")


app = FastAPI(
    lifespan=root, openapi_url="/openapi.json", docs_url="/docs", redoc_url="/redoc"
)

origins = ["http://localhost:5173", "https://h-app-omega.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=origins,
    allow_credentials=True,
    expose_headers=["x-auth-token", "x-session-expire"],
)

app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(clinics.router)


@app.get("/")
async def root_path():
    return {"message": "Welcome to Sopor-i-fix"}


@app.get("/health")
async def health_check():
    status = {"status": "ok"}
    return status


@app.get("/generate")
async def generate_data():
    await seed_db()
    return {"message": "Data generated successfully"}


# @app.middleware("http")
# async def logger(req: Request, call_next):
#     print(f"Request-Headers: {req.headers}")

#     body = await req.body()
#     print(f"Request-Body: {body}")

#     response = await call_next(req)
#     print(f"Response: {response.status_code}")

#     return response


if __name__ == "__main__":
    import uvicorn

    # update host === localhost to 0.0.0.0 and reload from false to true in prod
    uvicorn.run("app.main:app", host="localhost", port=8000, reload=True)
