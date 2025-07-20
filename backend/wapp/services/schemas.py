# https://docs.pydantic.dev/1.10/usage/schema/
# This schema is mainly use for data validation and response

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from services.models import StatusEnum


class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    price: float = 0.0
    location: Optional[str] = None
    seats_available: Optional[int] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[StatusEnum] = StatusEnum.upcoming


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    category: Optional[str]
    start_datetime: Optional[datetime]
    end_datetime: Optional[datetime]
    price: Optional[float]
    location: Optional[str]
    seats_available: Optional[int]
    image_url: Optional[str]
    tags: Optional[str]
    status: Optional[StatusEnum]


class EventOut(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: float
    tags: Optional[str] = None
    status: Optional[StatusEnum] = StatusEnum.upcoming
    note: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    price: Optional[float]
    tags: Optional[str]
    status: Optional[StatusEnum]
    note: Optional[str]


class ItemOut(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True