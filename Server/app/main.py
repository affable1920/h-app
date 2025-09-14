from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from app.routes import doctors


@asynccontextmanager
async def root(app: FastAPI):
    print("Starting up")

    # cache = doctors.Cache()
    # cache.set_cache_multiple(a=1, b=2, c=3)

    # print(cache.check_if_cached(a=1, b=2, c=3))

    yield
    print("Shutting down")

app = FastAPI(lifespan=root)

app.include_router(doctors.router)

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
