from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi


"""
    schemas = spec.get("components", {}).get("schemas", {})

    for key, schema in zip(schemas.keys(), schemas.values()):
        for p in schema.get("properties", {}).values():

            title = p.get('title', "")
            parts = title.split(" ") if title else []

            prefix = parts[0] if parts else ""
            suffix = parts[-1] if len(parts) > 1 else ""

            tsc_prop = "".join(
                [x for x in [prefix.lower(), suffix.capitalize()] if x])
            print(tsc_prop)

"""


def generate_openapi_spec(app: FastAPI):
    if app.openapi_schema:
        print("Returned already generated openapi spec")
        return app.openapi_schema

    """
    
    The path would be say /doctors and the path_data (path.values()) would contain details about the
    fucntion name -> operationId, parameters the route takes, their types, tags, response models ...

    Tags[0] would be the first tag as given by me inside the route files
    Operation Id would be the func name

    Using the rsplit method with the 2nd arg as 1 only splits once from the right
    thereby creating an array with two items: 1. Tags[0], 2. the http method example -> doctors and get

    The last part added by openapi to each operation id is the http method therefore the rsplit.
    
    """

    spec = get_openapi(
        title=app.title,
        routes=app.routes,
        version=app.version,
        description="Modified OpenAPI spec for the tsc client.",
    )

    try:
        paths = spec.get("paths", {})

        for path_data in paths.values():

            # operation means a function -> a route function
            # all route fns per route
            for operation in path_data.values():
                if not isinstance(operation, dict):
                    continue

                summary: str = operation.get("summary", "")
                parts = summary.split(" ") if summary else []

                prefix = parts[0] if parts else ""
                suffix = parts[-1] if len(parts) > 1 else ""

                fn_parts = [x for x in [
                    prefix.lower(), suffix.capitalize()] if x]
                fn_name = "".join(fn_parts)

                # operation["operationId"] = fn_name

        # app.openapi_schema = spec
        # return app.openapi_schema

    except Exception as e:
        print(e)
        return
