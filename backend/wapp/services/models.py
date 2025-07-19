# https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/basic_use.html
# Defines the database models for the application

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, Numeric, Enum, ForeignKey
from sqlalchemy.sql import func
from services.database import Base
import enum

# Data structure of Items table
class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    alt = Column(String(255), nullable=True)
    price = Column(Integer, nullable=False, default=0)
    favorite = Column(Boolean, default=False)
    size = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Structure of Event table
class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    fee = Column(String(10), nullable=False, default="0")
    earn = Column(String(10), nullable=False, default="0")
    date = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    month = Column(String(20), nullable=False)
    location = Column(String(255), nullable=True)
    enroll = Column(Boolean, default=False)
    end = Column(Boolean, default=False)
    seats = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Enum for transaction direction
class DirectionEnum(enum.Enum):
    credit = "credit"
    debit = "debit"

# Structure of transaction table 
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Numeric(18, 8), nullable=False)
    direction = Column(Enum(DirectionEnum), nullable=False)
    description = Column(String(500), nullable=False)
    date = Column(String(50), nullable=False)
    time = Column(String(20), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tx_hash = Column(String(66), nullable=True)  # 66 chars for Ethereum tx hash
    status = Column(String(20), nullable=True)   # pending/confirmed/failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Structure of User's data
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
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())