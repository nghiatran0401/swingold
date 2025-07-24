# https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/basic_use.html
# Defines the database models for the application


from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Enum, ForeignKey, Boolean
from sqlalchemy.sql import func
from services.database import Base
import enum

# Enum for transaction direction
class DirectionEnum(enum.Enum):
    credit = "credit"
    debit = "debit"

# Enum for transaction status
class StatusEnum(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    failed = "failed"

# Enum for item and event status
class ItemEventStatusEnum(enum.Enum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    price = Column(Numeric(10, 1), nullable=False, default=0.0)
    tags = Column(String(255), nullable=True)
    status = Column(Enum(ItemEventStatusEnum), default=ItemEventStatusEnum.upcoming)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=True)
    price = Column(Numeric(10), default=0)
    location = Column(String(255), nullable=True)
    seats_available = Column(Integer, nullable=True)
    image_url = Column(String(500), nullable=True)
    tags = Column(String(255), nullable=True)
    status = Column(Enum(ItemEventStatusEnum), default=ItemEventStatusEnum.upcoming)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Numeric(18, 8), nullable=False)
    direction = Column(Enum(DirectionEnum), nullable=False)
    tx_hash = Column(String(66), unique=True, nullable=False)
    description = Column(String(500), nullable=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    wallet_address = Column(String(42), unique=True, nullable=True)  # Ethereum address (42 chars)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())