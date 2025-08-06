from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from services.database import get_db
import services.models as models
from services.schemas import TransactionOut
from services.transaction_service import create_transaction_service
from services.web3 import get_balance
from datetime import datetime

router = APIRouter(
    prefix="/transfers",
    tags=["transfers"],
    responses={404: {"description": "Not found"}},
)

@router.post("/send", response_model=TransactionOut, status_code=201)
def send_gold(
    transfer_data: dict = Body(...),
    db: Session = Depends(get_db),
    x_user_id: str = Query(..., alias="X-User-Id")
):
    """
    Send Swingold tokens to another user.
    Expects: {recipient_address, amount, tx_hash}
    """
    try:
        # Validate required fields
        recipient_address = transfer_data.get("recipient_address")
        if not recipient_address:
            raise HTTPException(status_code=400, detail="recipient_address is required")
        
        amount = transfer_data.get("amount")
        if amount is None or amount <= 0:
            raise HTTPException(status_code=400, detail="amount must be positive")
        
        tx_hash = transfer_data.get("tx_hash")
        if not tx_hash:
            raise HTTPException(status_code=400, detail="tx_hash is required")

        # Find sender user
        user_id = int(x_user_id)
        sender = db.query(models.User).filter(models.User.id == user_id).first()
        if not sender:
            raise HTTPException(status_code=404, detail="Sender user not found")

        # Use transaction service for hybrid approach
        transaction_service = create_transaction_service(db)
        
        # Record the transfer
        transaction = transaction_service.record_transfer(
            user_id=user_id,
            amount=amount,
            tx_hash=tx_hash,
            recipient_address=recipient_address
        )
        
        return transaction
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record transfer: {str(e)}")

@router.get("/history/{user_id}")
def get_transfer_history(
    user_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Get transfer history for a specific user.
    """
    try:
        transaction_service = create_transaction_service(db)
        transfers = transaction_service.get_user_transaction_history(
            user_id, limit, offset, "transfer"
        )
        
        return {
            "transfers": transfers,
            "total": len(transfers),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transfer history: {str(e)}")

@router.get("/balance/{address}")
def get_user_balance(address: str):
    """
    Get user's Swingold balance from blockchain.
    """
    try:
        balance = get_balance(address)
        return {"address": address, "balance": balance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch balance: {str(e)}") 