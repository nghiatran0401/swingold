from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from services.database import get_db 
import services.models as models
from services.schemas import TransactionCreate, TransactionOut
from pydantic import BaseModel

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
    responses={404: {"description": "Not found"}},
)

class PurchaseTransactionRequest(BaseModel):
    amount: float
    direction: str
    tx_hash: str
    description: str
    user_id: int
    item_id: Optional[int] = None

class EarnTransactionRequest(BaseModel):
    amount: float
    direction: str
    tx_hash: str
    description: str
    user_id: int
    event_id: Optional[int] = None

# 1. Read all transactions list
@router.get("/", response_model=List[TransactionOut])
def read_transactions(
    skip: int = Query(0, ge=0, description="Number of transactions to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of transactions to return"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction)
    if user_id:
        query = query.filter(models.Transaction.user_id == user_id)
    transactions = query.order_by(models.Transaction.created_at.desc()).offset(skip).limit(limit).all()
    return transactions

# Fetch a single transaction by ID
@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

# Create new purchase transaction for user
@router.post("/user/{user_id}/purchase", response_model=TransactionOut)
def create_purchase_transaction(
    user_id: int,
    amount: float = Query(..., description="Purchase amount (positive)"),
    description: str = Query(..., description="Purchase description"),
    item_id: Optional[int] = Query(None, description="Purchased item ID"),
    quantity: int = Query(1, description="Quantity of items purchased"),
    tx_hash: Optional[str] = Query(None, description="On-chain transaction hash"),
    status_: Optional[str] = Query(None, alias="status", description="Transaction status (pending/confirmed/failed)"),
    db: Session = Depends(get_db)
):
    """Create a purchase transaction (debit)"""
    try:
        transaction_data = {
            "amount": amount,
            "direction": models.DirectionEnum.debit,
            "description": description,
            "user_id": user_id,
            "item_id": item_id,
            "tx_hash": tx_hash or f"0x{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "status": models.StatusEnum(status_) if status_ else models.StatusEnum.pending,
        }
        db_transaction = models.Transaction(**transaction_data)
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create purchase transaction: {str(e)}"
        )

# Create earning transaction for user 
@router.post("/user/{user_id}/earn", response_model=TransactionOut)
def create_earn_transaction(
    user_id: int,
    amount: float = Query(..., description="Earned amount (positive)"),
    description: str = Query(..., description="Earning description"),
    event_id: Optional[int] = Query(None, description="Registered event ID"),
    tx_hash: Optional[str] = Query(None, description="On-chain transaction hash"),
    status_: Optional[str] = Query(None, alias="status", description="Transaction status (pending/confirmed/failed)"),
    db: Session = Depends(get_db)
):
    """Create an earning transaction (credit)"""
    try:
        transaction_data = {
            "amount": amount,
            "direction": models.DirectionEnum.credit,
            "description": description,
            "user_id": user_id,
            "event_id": event_id,
            "tx_hash": tx_hash or f"0x{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "status": models.StatusEnum(status_) if status_ else models.StatusEnum.pending,
        }
        db_transaction = models.Transaction(**transaction_data)
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create earn transaction: {str(e)}"
        )

# Create purchase transaction (POST /purchase)
@router.post("/purchase", response_model=TransactionOut, status_code=201)
def create_purchase_transaction_post(
    transaction: PurchaseTransactionRequest,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-Id")
):
    """Create a purchase transaction via POST with JSON body"""
    try:
        transaction_data = {
            "amount": transaction.amount,
            "direction": models.DirectionEnum.debit,
            "description": transaction.description,
            "user_id": transaction.user_id,
            "item_id": transaction.item_id,
            "tx_hash": transaction.tx_hash,
            "status": models.StatusEnum.pending,
        }
        db_transaction = models.Transaction(**transaction_data)
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create purchase transaction: {str(e)}"
        )

# Create earn transaction (POST /earn)
@router.post("/earn", response_model=TransactionOut, status_code=201)
def create_earn_transaction_post(
    transaction: EarnTransactionRequest,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-Id")
):
    """Create an earn transaction via POST with JSON body"""
    try:
        transaction_data = {
            "amount": transaction.amount,
            "direction": models.DirectionEnum.credit,
            "description": transaction.description,
            "user_id": transaction.user_id,
            "event_id": transaction.event_id,
            "tx_hash": transaction.tx_hash,
            "status": models.StatusEnum.pending,
        }
        db_transaction = models.Transaction(**transaction_data)
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create earn transaction: {str(e)}"
        ) 