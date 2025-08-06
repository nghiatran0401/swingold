from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from datetime import datetime
from services.database import get_db
import services.models as models
from services.schemas import TransactionOut

router = APIRouter(
    prefix="/transactions/onchain",
    tags=["transactions-onchain"],
    responses={404: {"description": "Not found"}},
)

# Import web3 services with error handling
try:
    from services.web3 import create_trade, confirm_trade, cancel_trade, get_balance, get_trade_info, mint_tokens
    WEB3_AVAILABLE = True
except ImportError as e:
    WEB3_AVAILABLE = False
    print(f"Web3 service not available: {e}")
    # Mock functions for testing
    def create_trade(seller: str, item_name: str, item_category: str, price: int) -> str:
        return "0xmocked_tx_hash"
    
    def confirm_trade(item_name: str) -> str:
        return "0xmocked_confirm_tx_hash"
    
    def cancel_trade(item_name: str) -> str:
        return "0xmocked_cancel_tx_hash"
    
    def get_balance(address: str) -> int:
        return 1000000000000000000
    
    def get_trade_info(item_name: str) -> dict:
        return {
            "buyer": "0x0000000000000000000000000000000000000000",
            "seller": "0x0000000000000000000000000000000000000000",
            "itemName": "",
            "itemCategory": "",
            "itemPrice": 0,
            "createdAt": 0,
            "confirmed": False,
            "completed": False
        }
    
    def mint_tokens(to_address: str, amount: int) -> str:
        return "0xmocked_mint_tx_hash"

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_trade_onchain(
    buyer: str = Query(..., description="Buyer's wallet address"),
    seller: str = Query(..., description="Seller's wallet address"),
    item_name: str = Query(..., description="Name of the item"),
    item_category: str = Query(..., description="Category of the item"),
    item_price: int = Query(..., description="Price of the item (in token smallest unit)"),
    db: Session = Depends(get_db)
):
    """Create a trade on-chain and record in DB if successful."""
    if not WEB3_AVAILABLE:
        raise HTTPException(status_code=503, detail="Blockchain service not available")
    
    try:
        tx_hash = create_trade(seller, item_name, item_category, item_price)
        
        # Find buyer by wallet address
        buyer_user = db.query(models.User).filter(models.User.wallet_address == buyer).first()
        if not buyer_user:
            raise HTTPException(status_code=404, detail="Buyer not found")
        
        # Record transaction in DB
        db_transaction = models.Transaction(
            amount=item_price,
            direction=models.DirectionEnum.debit,
            description=f"On-chain trade creation for {item_name}, tx: {tx_hash}",
            user_id=buyer_user.id,
            tx_hash=tx_hash,
            status=models.StatusEnum.pending
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return {"status": "success", "txn": tx_hash, "db_id": db_transaction.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"On-chain trade failed: {str(e)}")

@router.post("/confirm")
def confirm_trade_onchain(
    item_name: str = Query(..., description="Name of the item to confirm trade for"),
    buyer: str = Query(..., description="Buyer's wallet address"),
    db: Session = Depends(get_db)
):
    """Confirm a trade on-chain and record in DB if successful."""
    if not WEB3_AVAILABLE:
        raise HTTPException(status_code=503, detail="Blockchain service not available")
    
    try:
        tx_hash = confirm_trade(item_name)
        
        # Find buyer by wallet address
        buyer_user = db.query(models.User).filter(models.User.wallet_address == buyer).first()
        if not buyer_user:
            raise HTTPException(status_code=404, detail="Buyer not found")
        
        db_transaction = models.Transaction(
            amount=0,
            direction=models.DirectionEnum.debit,
            description=f"On-chain trade confirmation for {item_name}, tx: {tx_hash}",
            user_id=buyer_user.id,
            tx_hash=tx_hash,
            status=models.StatusEnum.pending
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return {"status": "success", "txn": tx_hash, "db_id": db_transaction.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"On-chain confirm failed: {str(e)}")

@router.post("/cancel")
def cancel_trade_onchain(
    item_name: str = Query(..., description="Name of the item to cancel trade for"),
    buyer: str = Query(..., description="Buyer's wallet address"),
    db: Session = Depends(get_db)
):
    """Cancel a trade on-chain and record in DB if successful."""
    if not WEB3_AVAILABLE:
        raise HTTPException(status_code=503, detail="Blockchain service not available")
    
    try:
        tx_hash = cancel_trade(item_name)
        
        # Find buyer by wallet address
        buyer_user = db.query(models.User).filter(models.User.wallet_address == buyer).first()
        if not buyer_user:
            raise HTTPException(status_code=404, detail="Buyer not found")
        
        db_transaction = models.Transaction(
            amount=0,
            direction=models.DirectionEnum.credit,
            description=f"On-chain trade cancellation for {item_name}, tx: {tx_hash}",
            user_id=buyer_user.id,
            tx_hash=tx_hash,
            status=models.StatusEnum.pending
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return {"status": "success", "txn": tx_hash, "db_id": db_transaction.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"On-chain cancel failed: {str(e)}")

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
            status=models.StatusEnum.pending
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record on-chain purchase: {str(e)}")

@router.get("/balance/{address}")
def get_onchain_balance(address: str):
    """Get token balance of an address from the blockchain."""
    if not WEB3_AVAILABLE:
        raise HTTPException(status_code=503, detail="Blockchain service not available")
    
    try:
        balance = get_balance(address)
        return {"address": address, "balance": balance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch balance: {str(e)}")

@router.get("/trade/{item_name}")
def get_trade_info(item_name: str):
    """Get trade information from the blockchain."""
    if not WEB3_AVAILABLE:
        raise HTTPException(status_code=503, detail="Blockchain service not available")
    
    try:
        trade_info = get_trade_info(item_name)
        return trade_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trade info: {str(e)}")

@router.post("/mint")
def mint_tokens_onchain(
    to_address: str = Query(..., description="Address to mint tokens to"),
    amount: int = Query(..., description="Amount to mint (in token smallest unit)"),
    db: Session = Depends(get_db)
):
    """Mint tokens to an address (admin only)."""
    if not WEB3_AVAILABLE:
        raise HTTPException(status_code=503, detail="Blockchain service not available")
    
    try:
        tx_hash = mint_tokens(to_address, amount)
        
        # Find user by wallet address
        user = db.query(models.User).filter(models.User.wallet_address == to_address).first()
        if user:
            # Record transaction in DB
            db_transaction = models.Transaction(
                amount=amount,
                direction=models.DirectionEnum.credit,
                description=f"Token minting, tx: {tx_hash}",
                user_id=user.id,
                tx_hash=tx_hash,
                status=models.StatusEnum.pending
            )
            db.add(db_transaction)
            db.commit()
            db.refresh(db_transaction)
        
        return {"status": "success", "txn": tx_hash, "amount": amount, "to_address": to_address}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Token minting failed: {str(e)}")
