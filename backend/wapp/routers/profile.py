# This is a classic Web3 wallet verification pattern

# Cryptographic Principles: based on digital signature verification
# - Only the private key holder can sign a message
# - Anyone can verify the signature matches the public address
# - This proves ownership without revealing the private key

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from services.database import get_db
import services.models as models
import services.schemas as schemas
from routers.auth import get_current_user
import secrets
import time
from eth_account.messages import encode_defunct
from eth_account import Account

router = APIRouter()

# In-memory storage for challenges (in production, use Redis or database)
wallet_challenges = {}

@router.post("/wallet-challenge")
def request_wallet_challenge(request: schemas.WalletChallengeRequest, db: Session = Depends(get_db)):
    """
    Generate a challenge message for wallet signature verification
    """
    try:
        # Generate a random challenge
        challenge = f"Please sign this message to verify your wallet ownership: {secrets.token_hex(16)}"
        
        # Store challenge temporarily (expires in 5 minutes)
        wallet_challenges[request.address.lower()] = {
            "challenge": challenge,
            "timestamp": int(time.time())
        }
        
        return {"challenge": challenge}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate challenge: {str(e)}")

@router.post("/wallet-verify")
def verify_wallet_signature(request: schemas.WalletVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify the wallet signature against the challenge
    """
    try:
        address_lower = request.address.lower()
        
        # Check if challenge exists
        if address_lower not in wallet_challenges:
            raise HTTPException(status_code=400, detail="No challenge found for this address")
        
        challenge_data = wallet_challenges[address_lower]
        challenge = challenge_data["challenge"]
        
        # Verify signature
        message = encode_defunct(text=challenge)
        recovered_address = Account.recover_message(message, signature=request.signature)
        
        # Check if recovered address matches the claimed address
        if recovered_address.lower() != address_lower:
            raise HTTPException(status_code=400, detail="Signature verification failed")
        
        # Clean up challenge
        del wallet_challenges[address_lower]
        
        return {"verified": True, "address": recovered_address}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signature verification failed: {str(e)}")

@router.patch("/wallet-address")
def update_wallet_address(
    request: schemas.WalletAddressUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update user's wallet address after successful verification
    """
    try:
        # Check if wallet address is already linked to another user
        existing_user = db.query(models.User).filter(
            models.User.wallet_address == request.wallet_address,
            models.User.id != current_user.id
        ).first()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="This wallet address is already linked to another account")
        
        # Update current user's wallet address
        current_user.wallet_address = request.wallet_address
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Wallet address updated successfully",
            "wallet_address": current_user.wallet_address
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update wallet address: {str(e)}")

@router.get("/profile")
def get_user_profile(
    current_user: models.User = Depends(get_current_user)
):
    """
    Get current user's profile information
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "wallet_address": current_user.wallet_address,
        "gold_balance": current_user.gold_balance,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }
