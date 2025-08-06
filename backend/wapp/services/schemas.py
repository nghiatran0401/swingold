# https://docs.pydantic.dev/1.10/usage/schema/
# This schema is mainly use for data validation and response

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from services.models import StatusEnum, DirectionEnum, ItemEventStatusEnum


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
    status: Optional[ItemEventStatusEnum] = ItemEventStatusEnum.upcoming


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    price: Optional[float] = None
    location: Optional[str] = None
    seats_available: Optional[int] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[ItemEventStatusEnum] = None


class EventOut(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: float
    tags: Optional[str] = None
    status: Optional[ItemEventStatusEnum] = ItemEventStatusEnum.upcoming
    note: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    tags: Optional[str] = None
    status: Optional[ItemEventStatusEnum] = None
    note: Optional[str] = None


class ItemOut(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionBase(BaseModel):
    amount: float
    direction: DirectionEnum
    description: Optional[str] = None
    tx_hash: str
    status: Optional[str] = None
    user_id: int
    event_id: Optional[int] = None
    item_id: Optional[int] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(BaseModel):
    id: int
    amount: float
    direction: DirectionEnum
    tx_hash: str
    description: Optional[str]
    status: Optional[str]
    user_id: int
    event_id: Optional[int]
    item_id: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OnchainPurchaseCreate(BaseModel):
    price: int
    item_id: int
    tx_hash: str
    quantity: int = 1

class TransferCreate(BaseModel):
    recipient_address: str
    amount: float
    tx_hash: str
