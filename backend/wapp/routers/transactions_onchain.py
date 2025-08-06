from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlalchemy.orm import Session
from services.database import get_db
import services.models as models
from services.transaction_service import create_transaction_service
from services.web3 import get_web3_service
from services.schemas import TransactionOut
from typing import Optional

router = APIRouter()

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_trade_onchain(
    buyer: str = Query(..., description="Buyer's wallet address"),
    seller: str = Query(..., description="Seller's wallet address"),
    item_name: str = Query(..., description="Name of the item"),
    item_category: str = Query(..., description="Category of the item"),
    item_price: int = Query(..., description="Price of the item (in token smallest unit)"),
    db: Session = Depends(get_db)
):
    """
    Create a trade on the blockchain.
    """
    try:
        # Get web3 service
        web3_service = get_web3_service()
        
        # Create trade on blockchain
        tx_hash = web3_service.create_trade(seller, item_name, item_category, item_price)
        
        # Record transaction in database (without user lookup)
        transaction_service = create_transaction_service(db)
        transaction = transaction_service.record_trade_creation(
            buyer_address=buyer,
            seller_address=seller,
            item_name=item_name,
            item_category=item_category,
            amount=item_price,
            tx_hash=tx_hash
        )
        
        return {"tx_hash": tx_hash, "transaction_id": transaction.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create trade: {str(e)}")

@router.post("/confirm")
def confirm_trade_onchain(
    item_name: str = Query(..., description="Name of the item to confirm trade for"),
    buyer: str = Query(..., description="Buyer's wallet address"),
    db: Session = Depends(get_db)
):
    """
    Confirm a trade on the blockchain.
    """
    try:
        # Get web3 service
        web3_service = get_web3_service()
        
        # Confirm trade on blockchain
        tx_hash = web3_service.confirm_trade(item_name)
        
        # Record transaction in database (without user lookup)
        transaction_service = create_transaction_service(db)
        transaction = transaction_service.record_trade_confirmation(
            buyer_address=buyer,
            item_name=item_name,
            tx_hash=tx_hash
        )
        
        return {"tx_hash": tx_hash, "transaction_id": transaction.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to confirm trade: {str(e)}")

@router.post("/cancel")
def cancel_trade_onchain(
    item_name: str = Query(..., description="Name of the item to cancel trade for"),
    buyer: str = Query(..., description="Buyer's wallet address"),
    db: Session = Depends(get_db)
):
    """
    Cancel a trade on the blockchain.
    """
    try:
        # Get web3 service
        web3_service = get_web3_service()
        
        # Cancel trade on blockchain
        tx_hash = web3_service.cancel_trade(item_name)
        
        # Record transaction in database (without user lookup)
        transaction_service = create_transaction_service(db)
        transaction = transaction_service.record_trade_cancellation(
            buyer_address=buyer,
            item_name=item_name,
            tx_hash=tx_hash
        )
        
        return {"tx_hash": tx_hash, "transaction_id": transaction.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to cancel trade: {str(e)}")

@router.post("/purchase", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def record_onchain_purchase(
    purchase: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Record an on-chain purchase using hybrid blockchain/database approach.
    Expects: {item_id, price, tx_hash, user_id, quantity}
    """
    try:
        # Validate required fields
        user_id = purchase.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        price = purchase.get("price")
        if price is None:
            raise HTTPException(status_code=400, detail="price is required")
        item_id = purchase.get("item_id")
        tx_hash = purchase.get("tx_hash")

        # Verify user exists
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Use transaction service for hybrid approach
        transaction_service = create_transaction_service(db)
        
        # Record item purchase
        transaction = transaction_service.record_item_purchase(
            user_id=user.id,
            item_id=item_id,
            amount=price,
            tx_hash=tx_hash
        )
        
        return transaction
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record on-chain purchase: {str(e)}")

@router.post("/event-registration", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def record_event_registration(
    registration: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Record an event registration (user earns Swingold).
    Expects: {event_id, amount, tx_hash, user_id}
    """
    try:
        # Validate required fields
        user_id = registration.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        amount = registration.get("amount")
        if amount is None:
            raise HTTPException(status_code=400, detail="amount is required")
        event_id = registration.get("event_id")
        tx_hash = registration.get("tx_hash")

        # Verify user exists
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Use transaction service for hybrid approach
        transaction_service = create_transaction_service(db)
        
        # Record event registration
        transaction = transaction_service.record_event_registration(
            user_id=user.id,
            event_id=event_id,
            amount=amount,
            tx_hash=tx_hash
        )
        
        return transaction
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record event registration: {str(e)}")

@router.post("/transfer", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def record_transfer(
    transfer: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Record a Swingold transfer transaction.
    Expects: {amount, tx_hash, user_id, recipient_address}
    """
    try:
        # Validate required fields
        user_id = transfer.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        amount = transfer.get("amount")
        if amount is None:
            raise HTTPException(status_code=400, detail="amount is required")
        recipient_address = transfer.get("recipient_address")
        if not recipient_address:
            raise HTTPException(status_code=400, detail="recipient_address is required")
        tx_hash = transfer.get("tx_hash")
        if not tx_hash:
            raise HTTPException(status_code=400, detail="tx_hash is required")

        # Verify user exists
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Use transaction service for hybrid approach
        transaction_service = create_transaction_service(db)
        
        # Record transfer
        transaction = transaction_service.record_transfer(
            user_id=user.id,
            amount=amount,
            tx_hash=tx_hash,
            recipient_address=recipient_address
        )
        
        return transaction
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record transfer: {str(e)}")

@router.get("/balance/{address}")
def get_onchain_balance(address: str):
    """
    Get the on-chain balance for a wallet address.
    """
    try:
        web3_service = get_web3_service()
        balance = web3_service.get_balance(address)
        return {"balance": str(balance)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get balance: {str(e)}")

@router.get("/trade/{item_name}")
def get_trade_info(item_name: str):
    """
    Get trade information for a specific item.
    """
    try:
        web3_service = get_web3_service()
        trade_info = web3_service.get_trade_info(item_name)
        return trade_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trade info: {str(e)}")

@router.post("/mint")
def mint_tokens_onchain(
    to_address: str = Query(..., description="Address to mint tokens to"),
    amount: int = Query(..., description="Amount to mint (in token smallest unit)"),
    db: Session = Depends(get_db)
):
    """
    Mint tokens to a specific address.
    """
    try:
        # Mint tokens on blockchain
        web3_service = get_web3_service()
        tx_hash = web3_service.mint_tokens(to_address, amount)
        
        # Record minting transaction in database (without user lookup)
        transaction_service = create_transaction_service(db)
        transaction = transaction_service.record_token_minting(
            to_address=to_address,
            amount=amount,
            tx_hash=tx_hash
        )
        
        return {"tx_hash": tx_hash, "transaction_id": transaction.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to mint tokens: {str(e)}")

@router.get("/transaction/{tx_hash}/details")
def get_transaction_details_from_blockchain(tx_hash: str, db: Session = Depends(get_db)):
    """
    Get transaction details from blockchain and sync with database.
    """
    try:
        # Get transaction from database
        transaction = db.query(models.Transaction).filter(models.Transaction.tx_hash == tx_hash).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Get blockchain details
        web3_service = get_web3_service()
        blockchain_details = web3_service.get_transaction_details(tx_hash)
        
        return {
            "database_transaction": transaction,
            "blockchain_details": blockchain_details
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get transaction details: {str(e)}")

@router.post("/transaction/{tx_hash}/sync")
def sync_transaction_from_blockchain(tx_hash: str, db: Session = Depends(get_db)):
    """
    Sync transaction status from blockchain to database.
    """
    try:
        # Get transaction from database
        transaction = db.query(models.Transaction).filter(models.Transaction.tx_hash == tx_hash).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Sync with blockchain
        web3_service = get_web3_service()
        web3_service.sync_transaction_status(tx_hash, transaction)
        
        db.commit()
        db.refresh(transaction)
        
        return {"message": "Transaction synced successfully", "transaction": transaction}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to sync transaction: {str(e)}")

@router.get("/user/{user_id}/history")
def get_user_transaction_history(
    user_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    trade_type: Optional[str] = Query(None, description="Filter by trade type"),
    db: Session = Depends(get_db)
):
    """
    Get transaction history for a specific user.
    """
    try:
        # Verify user exists
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Build query
        query = db.query(models.Transaction).filter(models.Transaction.user_id == user_id)
        
        # Apply filters
        if trade_type:
            query = query.filter(models.Transaction.trade_type == trade_type)
        
        # Apply pagination
        total = query.count()
        transactions = query.order_by(models.Transaction.created_at.desc()).offset(offset).limit(limit).all()
        
        return {
            "transactions": transactions,
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get transaction history: {str(e)}")
