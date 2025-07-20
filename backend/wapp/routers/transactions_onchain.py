from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
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

"""Get token balance of an address from the blockchain."""
@router.get("/balance/{address}")
def get_onchain_balance(address: str):
    try:
        balance = get_balance(address)
        return {"address": address, "balance": balance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch balance: {str(e)}")

@router.post("/purchase", status_code=status.HTTP_201_CREATED)
def record_onchain_purchase(
    purchase: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Record an on-chain purchase after verifying the tx_hash.
    Expects: {item_id, price, tx_hash, wallet_address, size}
    """
    try:
        # Find user by wallet_address
        user = db.query(models.User).filter(models.User.wallet_address == purchase["wallet_address"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User with this wallet address not found")
        # TODO: Verify tx_hash on-chain (placeholder)
        # For now, just record the transaction
        db_transaction = models.Transaction(
            amount=purchase["price"],
            direction=models.DirectionEnum.debit,
            description=f"On-chain purchase of item_id {purchase['item_id']}, size: {purchase.get('size', '')}, tx: {purchase['tx_hash']}",
            date=datetime.now().strftime("%Y-%m-%d"),
            time=datetime.now().strftime("%H:%M:%S"),
            user_id=user.id,
            tx_hash=purchase["tx_hash"],
            status="pending"
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return {"status": "success", "db_id": db_transaction.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record on-chain purchase: {str(e)}")
