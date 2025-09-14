import json
from fastapi import Depends
from fastapi.routing import APIRouter
from app.models.queryparams import QueryParameters

router = APIRouter(prefix="/doctors", tags=["doctors"])

cache_key = ""
docs_cache = []

cache_expired = False
# mutate on any crud op

all_docs = []
docs_file = "data/doctors.json"

with open(docs_file, "r") as f:
    all_docs: list[dict] = json.load(f)


class Cache:
    def __init__(self):
        self.cache = {}
        self.is_expired = False

    def set_cache(self, key, val):
        self.cache[key] = val

    def set_cache_multiple(self, **kwargs):
        for key, val in kwargs.items():
            self.set_cache(key, val)

    def check_if_cached(self, **kwargs):
        return all([self.cache.get(key) == val for key, val in kwargs.items()])


@router.get("", response_model=list[dict])
async def get_docs(params: QueryParameters = Depends()):
    global docs_cache
    global docs_file
    global cache_key
    global all_docs

    curr_cache_key = f"{params.page}-{params.max}-{params.search_query}"
    if cache_key == curr_cache_key and not cache_expired:
        print("return cache hit")
        return docs_cache

    cache_key = curr_cache_key

    start = (params.page - 1) * params.max
    end = start + params.max

    try:
        doctors = all_docs
        if params.search_query:
            doctors = [doc for doc in all_docs if doc["name"].strip(
            ).lower().startswith(params.search_query)]

        docs = doctors[start: min(len(doctors), end)]
        docs_cache = docs

        return docs

    except FileNotFoundError:
        return {"error": "File not found"}
