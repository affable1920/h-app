from pathlib import Path
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


# Skip if data already exists

from app.routes import auth
from app.routes import doctors
from app.routes import clinics
from app.services.data_generator import main
from app.services.openapi_spec import generate_openapi_spec


@asynccontextmanager
async def root(app: FastAPI):
    print("Starting up")

    if Path("data/Doctors.json").exists():
        print("Data already generated !")
        pass

    else:
        print("Generating data")
        main()

    app.openapi_schema = generate_openapi_spec(app)  # Generate schema once

    yield

    print("Shutting down")

app = FastAPI(lifespan=root, openapi_url="/openapi.json",
              docs_url="/docs", redoc_url="/redoc")


app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=["*"],
    allow_credentials=True,
)


app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(clinics.router)


@app.get("/")
async def root_path():
    return {"message": "Welcome to Sopor-i-fix"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="localhost", port=8000, reload=True)
