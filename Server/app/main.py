from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, clinics, doctors
from app.services.data_generator import main
from app.services.openapi_spec import generate_openapi_spec


@asynccontextmanager
async def root(app: FastAPI):
    print("Starting up")
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
    allow_origins=origins,
    allow_credentials=True,
    expose_headers=["x-auth-token", "x-session-expire"]
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
    main()
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
