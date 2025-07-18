from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from services.database import get_db
import services.models as models
from services.web3 import create_trade, confirm_trade, get_balance

router = APIRouter(
    prefix="/transactions/onchain",
    tags=["transactions-onchain"],
    responses={404: {"description": "Not found"}},
)

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_trade_onchain(
    buyer: str = Query(..., description="Buyer's wallet address"),
    seller: str = Query(..., description="Seller's wallet address"),
    item_name: str = Query(..., description="Name of the item"),
    item_price: int = Query(..., description="Price of the item (in token smallest unit)"),
    db: Session = Depends(get_db)
):
    """Create a trade on-chain and record in DB if successful."""
    try:
        tx_hash = create_trade(seller, item_name, item_price)
        # Record transaction in DB
        db_transaction = models.Transaction(
            amount=f"-{item_price}",
            description=f"On-chain purchase of {item_name}, tx: {tx_hash}",
            date=datetime.now().strftime("%Y-%m-%d"),  
            time=datetime.now().strftime("%H:%M:%S"),    
            user_id=None
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return {"status": "success", "txn": tx_hash, "db_id": db_transaction.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"On-chain trade failed: {str(e)}")

@router.post("/confirm/{trade_id}")
def confirm_trade_onchain(
    trade_id: int,
    buyer: str = Query(..., description="Buyer's wallet address"),
    db: Session = Depends(get_db)
):
    """Confirm a trade on-chain and record in DB if successful."""
    try:
        tx_hash = confirm_trade(trade_id)
        db_transaction = models.Transaction(
            amount="0",
            description=f"On-chain trade confirmation for trade_id {trade_id}, tx: {tx_hash}",
            date=datetime.now().strftime("%Y-%m-%d"),  
            time=datetime.now().strftime("%H:%M:%S"),    
            user_id=None
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return {"status": "success", "txn": tx_hash, "db_id": db_transaction.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"On-chain confirm failed: {str(e)}")

@router.get("/balance/{address}")
def get_onchain_balance(address: str):
    """Get token balance of an address from the blockchain."""
    try:
        balance = get_balance(address)
        return {"address": address, "balance": balance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch balance: {str(e)}")
