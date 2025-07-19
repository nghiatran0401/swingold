from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from services.database import get_db 
import services.models as models

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
    responses={404: {"description": "Not found"}},
)

# 1. Read all transactions list
@router.get("/")
def read_transactions(
    skip: int = Query(0, ge=0, description="Number of transactions to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of transactions to return"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    db: Session = Depends(get_db)
):
    """Get all transactions with optional filtering and pagination"""
    query = db.query(models.Transaction)
    
    if user_id:
        query = query.filter(models.Transaction.user_id == user_id)
    
    transactions = query.order_by(models.Transaction.created_at.desc()).offset(skip).limit(limit).all()
    return transactions

# Read current user's balance / current gold
@router.get("/user/{user_id}/balance")
def get_user_balance(user_id: int, db: Session = Depends(get_db)):
    """Get user's current gold balance"""
    # For now, return a default balance since we don't have user authentication yet
    # In a real application, this would calculate from transactions
    return {"gold_balance": 300}

# Create new purchase transaction for user

@router.post("/user/{user_id}/purchase")
def create_purchase_transaction(
    user_id: int,
    amount: int = Query(..., description="Purchase amount (negative)"),
    description: str = Query(..., description="Purchase description"),
    db: Session = Depends(get_db)
):
    """Create a purchase transaction (negative amount)"""
    try:
        transaction_data = {
            "amount": f"-{abs(amount)}",
            "description": description,
            "date": "06/06/2025",  # This should be dynamic in production
            "time": "10:00:00",
            "user_id": user_id
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
@router.post("/user/{user_id}/earn")
def create_earn_transaction(
    user_id: int,
    amount: int = Query(..., description="Earned amount (positive)"),
    description: str = Query(..., description="Earning description"),
    db: Session = Depends(get_db)
):
    """Create an earning transaction (positive amount)"""
    try:
        transaction_data = {
            "amount": f"+{abs(amount)}",
            "description": description,
            "date": "06/06/2025",  # This should be dynamic in production
            "time": "10:00:00",
            "user_id": user_id
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