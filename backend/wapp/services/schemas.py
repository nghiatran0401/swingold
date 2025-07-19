# https://fastapi.tiangolo.com/tutorial/sql-databases/
# Defines how data is validated and serialized for API endpoints

from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    price: float
    favorite: bool = False
    size: Optional[List[str]] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    favorite: Optional[bool] = None
    size: Optional[List[str]] = None

class ItemResponse(ItemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    date: str
    end_date: Optional[str] = None
    image: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    seats: Optional[int] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    end_date: Optional[str] = None
    image: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    seats: Optional[int] = None

class EventResponse(EventBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionBase(BaseModel):
    amount: Decimal = Field(...)
    direction: Literal['credit', 'debit']
    description: str = Field(..., min_length=1, max_length=500)
    date: str = Field(..., max_length=50)
    time: Optional[str] = None
    user_id: int
    tx_hash: Optional[str] = None
    status: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None)
    direction: Optional[Literal['credit', 'debit']] = None
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    date: Optional[str] = Field(None, max_length=50)
    time: Optional[str] = None
    user_id: Optional[int] = None
    tx_hash: Optional[str] = None
    status: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    email: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)

class UserResponse(UserBase):
    id: int
    wallet_address: Optional[str] = None
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

# Wallet Schemas
class WalletChallengeRequest(BaseModel):
    address: str = Field(..., min_length=42, max_length=42, description="Ethereum wallet address")

class WalletVerifyRequest(BaseModel):
    address: str = Field(..., min_length=42, max_length=42, description="Ethereum wallet address")
    signature: str = Field(..., description="Signed message signature")

class WalletAddressUpdate(BaseModel):
    wallet_address: str = Field(..., min_length=42, max_length=42, description="Ethereum wallet address")
