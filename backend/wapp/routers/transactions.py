from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from services.database import get_db 
import services.models as models
import services.schemas as schemas

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
    responses={404: {"description": "Not found"}},
)

# 1. Read all transactions list
@router.get("/", response_model=List[schemas.TransactionResponse])
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

# 2. Read specific transaction using its id
@router.get("/{transaction_id}", response_model=schemas.TransactionResponse)
def read_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Get a specific transaction by ID"""
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Transaction not found"
        )
    return db_transaction

# 3. Create transaction
@router.post("/", response_model=schemas.TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    """Create a new transaction"""
    try:
        db_transaction = models.Transaction(**transaction.model_dump())
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create transaction: {str(e)}"
        )

#4. Update transaction details
@router.put("/{transaction_id}", response_model=schemas.TransactionResponse)
def update_transaction(
    transaction_id: int, 
    transaction_update: schemas.TransactionUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing transaction"""
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Transaction not found"
        )
    
    try:
        update_data = transaction_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_transaction, key, value)
        
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update transaction: {str(e)}"
        )
    
# 5. Delete transaction record
@router.delete("/{transaction_id}", response_model=schemas.MessageResponse)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a transaction"""
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Transaction not found"
        )
    
    try:
        db.delete(db_transaction)
        db.commit()
        return {"message": "Transaction deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete transaction: {str(e)}"
        )


# Read current user's balance / current gold
@router.get("/user/{user_id}/balance", response_model=dict)
def get_user_balance(user_id: int, db: Session = Depends(get_db)):
    """Get user's current gold balance"""
    # For now, return a default balance since we don't have user authentication yet
    # In a real application, this would calculate from transactions
    return {"gold_balance": 300}

# Create new purchase transaction for user

@router.post("/user/{user_id}/purchase", response_model=schemas.TransactionResponse)
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
@router.post("/user/{user_id}/earn", response_model=schemas.TransactionResponse)
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