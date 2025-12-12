from datetime import datetime
from pydantic import BaseModel, ConfigDict


class BaseModelConfig(BaseModel):
    class Config:
        model_config = ConfigDict(
            json_encoders={
                datetime: lambda v: v.isoformat()
            }
        )
