from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.database import get_db
from services import models
from sqlalchemy import func

router = APIRouter(prefix="/api/v1/statistics", tags=["statistics"])

@router.get("/user/{user_id}")
def get_user_statistics(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    total_spent = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.direction == models.DirectionEnum.debit
    ).scalar() or 0
    
    total_earned = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.direction == models.DirectionEnum.credit
    ).scalar() or 0
    
    event_spending = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.direction == models.DirectionEnum.debit,
        models.Transaction.event_id.isnot(None)
    ).scalar() or 0
    
    item_spending = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.direction == models.DirectionEnum.debit,
        models.Transaction.item_id.isnot(None)
    ).scalar() or 0
    
    transfer_spending = total_spent - event_spending - item_spending
    
    spending_breakdown = {
        "events": float(event_spending),
        "items": float(item_spending),
        "transfers": float(transfer_spending)
    }
    
    return {
        "total_spent": float(total_spent),
        "total_earned": float(total_earned),
        "spending_breakdown": spending_breakdown,
        "spending_percentage": {
            "events": (event_spending / total_spent * 100) if total_spent > 0 else 0,
            "items": (item_spending / total_spent * 100) if total_spent > 0 else 0,
            "transfers": (transfer_spending / total_spent * 100) if total_spent > 0 else 0
        }
    }
