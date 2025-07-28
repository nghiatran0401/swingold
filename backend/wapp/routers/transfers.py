from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from services.database import get_db
from services import models, schemas
from typing import Optional

router = APIRouter(prefix="/api/v1/transfers", tags=["transfers"])

@router.post("/send")
def send_gold(
    transfer_data: schemas.TransferCreate,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None)
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    sender_id = int(x_user_id)
    sender = db.query(models.User).filter(models.User.id == sender_id).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")
    
    recipient = db.query(models.User).filter(models.User.wallet_address == transfer_data.recipient_address).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    if sender.id == recipient.id:
        raise HTTPException(status_code=400, detail="Cannot send gold to yourself")
    
    sender_transaction = models.Transaction(
        amount=transfer_data.amount,
        direction=models.DirectionEnum.debit,
        tx_hash=transfer_data.tx_hash,
        description=f"Sent gold to {recipient.username}",
        status=models.StatusEnum.confirmed,
        user_id=sender.id
    )
    
    recipient_transaction = models.Transaction(
        amount=transfer_data.amount,
        direction=models.DirectionEnum.credit,
        tx_hash=transfer_data.tx_hash,
        description=f"Received gold from {sender.username}",
        status=models.StatusEnum.confirmed,
        user_id=recipient.id
    )
    
    db.add(sender_transaction)
    db.add(recipient_transaction)
    db.commit()
    
    return {"message": "Gold transfer successful", "amount": transfer_data.amount}

@router.get("/history/{user_id}")
def get_transfer_history(user_id: int, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.description.like("%gold%")
    ).order_by(models.Transaction.created_at.desc()).all()
    
    return transactions
