from bson import ObjectId
from pydantic import BaseModel, Field
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic models."""

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.json_or_python_schema(
                json_schema=core_schema.str_schema(),
                python_schema=core_schema.union_schema(
                    [
                        core_schema.is_instance_schema(ObjectId),
                        core_schema.str_schema(),
                    ]
                ),
            ),
        )

    @classmethod
    def validate(cls, value):
        if isinstance(value, ObjectId):
            return value
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")
        return ObjectId(value)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema


class MongoModel(BaseModel):
    """Base model that sets common config for Mongo documents."""

    id: PyObjectId | None = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
