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
        print("Generating data ...")
        main()

    app.openapi_schema = generate_openapi_spec(app)  # Generate schema once

    yield
    print("Shutting down")

app = FastAPI(lifespan=root, openapi_url="/openapi.json",
              docs_url="/docs", redoc_url="/redoc")


origins = [
    "http://localhost:5173",
    "https://h-app-omega.vercel.app"
]


app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    allow_origins=origins,
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
    # update host === localhost to 0.0.0.0 and reload from false to true
    uvicorn.run("app.main:app", host="localhost", port=8000, reload=True)
