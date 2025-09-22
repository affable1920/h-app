from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from app.routes import ai
from app.routes import doctors
from app.routes import clinics


@asynccontextmanager
async def root(app: FastAPI):
    print("Starting up")

    yield
    print("Shutting down")

app = FastAPI(lifespan=root)

app.include_router(ai.router)
app.include_router(doctors.router)
app.include_router(clinics.router)

app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=["*"]
)


@app.get("/")
async def root_path():
    return {"message": "Hello World"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="localhost", port=8000, reload=True)
