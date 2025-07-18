# https://fastapi.tiangolo.com/tutorial/sql-databases/
# Defines how data is validated and serialized for API endpoints

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

# Item Schemas
class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = None
    alt: Optional[str] = None
    price: int = Field(..., ge=0)
    favorite: bool = False
    size: Optional[List[str]] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = None
    alt: Optional[str] = None
    price: Optional[int] = Field(None, ge=0)
    favorite: Optional[bool] = None
    size: Optional[List[str]] = None

class ItemResponse(ItemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Event Schemas
class EventBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=500)
    fee: str = Field(..., max_length=10)
    earn: str = Field(..., max_length=10)
    date: str = Field(..., max_length=100)
    description: Optional[str] = None
    month: str = Field(..., max_length=20)
    location: Optional[str] = None
    enroll: bool = False
    end: bool = False
    seats: Optional[int] = Field(None, ge=0)

class EventCreate(EventBase):
   pass

class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=500)
    fee: Optional[str] = Field(None, max_length=10)
    earn: Optional[str] = Field(None, max_length=10)
    date: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    month: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = None
    enroll: Optional[bool] = None
    end: Optional[bool] = None
    seats: Optional[int] = Field(None, ge=0)

class EventResponse(EventBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionBase(BaseModel):
    amount: str = Field(..., max_length=20)
    description: str = Field(..., min_length=1, max_length=500)
    date: str = Field(..., max_length=50)
    time: Optional[str] = None
    user_id: Optional[int] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    date: Optional[str] = Field(None, max_length=50)
    time: Optional[str] = None
    user_id: Optional[int] = None

class TransactionResponse(TransactionBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: Optional[str] = None
    gold_balance: int = Field(default=300, ge=0)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    email: Optional[str] = None
    gold_balance: Optional[int] = Field(None, ge=0)
    password: Optional[str] = Field(None, min_length=6)

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Response Schemas
class MessageResponse(BaseModel):
    message: str

class ListResponse(BaseModel):
    items: List[ItemResponse]
    total: int
    page: int
    size: int
