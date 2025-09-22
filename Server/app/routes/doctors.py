import json
from fastapi.routing import APIRouter
from fastapi import Depends, HTTPException
from app.models.responses import DoctorResponse
from app.models.queryparams import QueryParameters

router = APIRouter(prefix="/doctors", tags=["doctors"])

cache_key = ""
cache = []

cache_expired = False
# mutate on any crud op

all_docs = []
docs_file = "data/doctors.json"

with open(docs_file, "r") as f:
    all_docs: list[dict] = json.load(f)


@router.get("", response_model=DoctorResponse)
async def get_docs(params: QueryParameters = Depends()):
    global cache
    global docs_file
    global cache_key
    global all_docs

    curr_cache_key = f"{params.page}-{params.max}-{params.search_query}"
    if curr_cache_key == cache_key:
        print("return cache hit")
        return cache

    cache_key = curr_cache_key

    start = (params.page - 1) * params.max
    end = start + params.max

    try:
        doctors = all_docs
        if params.search_query:
            doctors = [doc for doc in all_docs if doc["name"].strip(
            ).lower().startswith(params.search_query)]

        docs = doctors[start: min(len(doctors), end)]

        response = {"doctors": docs, "total_count": len(
            all_docs), "curr_count": len(docs)}

        cache = response
        return response

    except (FileNotFoundError, Exception) as e:
        raise HTTPException(status_code=404, detail={
                            "msg": "An Unexpected error occurred !", "error": str(e)})
