from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from datetime import datetime
from services.database import get_db
import services.models as models
from services.web3 import create_trade, confirm_trade, get_balance
from services.schemas import TransactionOut

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
            amount=item_price,
            direction=models.DirectionEnum.debit,
            description=f"On-chain purchase of {item_name}, tx: {tx_hash}",
            user_id=None,  # Set this to the correct user_id if available
            tx_hash=tx_hash,
            status="pending"
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
            amount=0,
            direction=models.DirectionEnum.debit,
            description=f"On-chain trade confirmation for trade_id {trade_id}, tx: {tx_hash}",
            user_id=None,  # Set this to the correct user_id if available
            tx_hash=tx_hash,
            status="pending"
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return {"status": "success", "txn": tx_hash, "db_id": db_transaction.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"On-chain confirm failed: {str(e)}")


@router.post("/purchase", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def record_onchain_purchase(
    purchase: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Record an on-chain purchase or event registration after verifying the tx_hash.
    Expects: {item_id, event_id, price, tx_hash, wallet_address, quantity}
    """
    try:
        # Validate required fields
        wallet_address = purchase.get("wallet_address")
        if not wallet_address:
            raise HTTPException(status_code=400, detail="wallet_address is required")
        price = purchase.get("price")
        if price is None:
            raise HTTPException(status_code=400, detail="price is required")
        item_id = purchase.get("item_id")
        event_id = purchase.get("event_id")
        tx_hash = purchase.get("tx_hash")

        # Find user by wallet_address
        user = db.query(models.User).filter(models.User.wallet_address == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User with this wallet address not found")
        
        # Compose description and direction
        desc = ""
        direction = None
        if item_id:
            desc = f"On-chain purchase of item_id {item_id}, tx: {tx_hash}"
            direction = models.DirectionEnum.debit
        elif event_id:
            desc = f"On-chain event registration for event_id {event_id}, tx: {tx_hash}"
            direction = models.DirectionEnum.credit
        else:
            desc = f"On-chain transaction, tx: {tx_hash}"
            direction = models.DirectionEnum.debit

        db_transaction = models.Transaction(
            amount=price,
            direction=direction,
            description=desc,
            user_id=user.id,
            item_id=item_id,
            event_id=event_id,
            tx_hash=tx_hash,
            status="pending"
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record on-chain purchase: {str(e)}")


"""Get token balance of an address from the blockchain."""
@router.get("/balance/{address}")
def get_onchain_balance(address: str):
    try:
        balance = get_balance(address)
        return {"address": address, "balance": balance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch balance: {str(e)}")
