# https://stackoverflow.com/questions/66736079/verify-metamask-signature-ethereum-using-python
# https://eth-account.readthedocs.io/en/stable/
# This is a classic Web3 wallet verification pattern

# Cryptographic Principles: based on digital signature verification
# - Only the private key holder can sign a message
# - Anyone can verify the signature matches the public address
# - This proves ownership without revealing the private key

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from services.database import get_db
import services.models as models
import secrets
import time
from eth_account.messages import encode_defunct
from eth_account import Account

router = APIRouter()

# In-memory storage for challenges (in production, use Redis or database)
wallet_challenges = {}

"""
Generate a challenge message for wallet signature verification
"""
@router.post("/request-wallet-challenge")
def request_wallet_challenge(request: dict):
    try:
        address = request.get('address')
        if not address:
            raise HTTPException(status_code=400, detail="Wallet address is required")
            
        # Generate a random challenge
        challenge = f"Please sign this message to verify your wallet ownership: {secrets.token_hex(16)}"
        
        # Store challenge temporarily (expires in 5 minutes)
        wallet_challenges[address.lower()] = {
            "challenge": challenge,
            "timestamp": int(time.time())
        }
        
        return {"challenge": challenge}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate challenge: {str(e)}")


"""
Verify the wallet signature against the challenge
"""
@router.post("/verify-wallet-signature")
def verify_wallet_signature(request: dict):
    try:
        address_lower = request.get('address').lower()
        
        # Check if challenge exists
        if address_lower not in wallet_challenges:
            raise HTTPException(status_code=400, detail="No challenge found for this address")
        
        challenge_data = wallet_challenges[address_lower]
        challenge = challenge_data["challenge"]
        
        # Verify signature
        signature = request.get('signature')
        if not signature:
            raise HTTPException(status_code=400, detail="Signature is required")
            
        message = encode_defunct(text=challenge)
        recovered_address = Account.recover_message(message, signature=signature)
        
        # Check if recovered address matches the claimed address
        if recovered_address.lower() != address_lower:
            raise HTTPException(status_code=400, detail="Signature verification failed")
        
        # Clean up challenge
        del wallet_challenges[address_lower]
        
        return {"verified": True, "address": recovered_address}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signature verification failed: {str(e)}")


"""
Update user's wallet address after successful verification
"""
@router.patch("/update-wallet-address")
def update_wallet_address(request: dict, db: Session = Depends(get_db), x_user_id: str = Header(None, alias="X-User-Id")):
    try:
        # Validate user ID
        if not x_user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
            
        user_id = int(x_user_id)
        wallet_address = request.get('wallet_address')
        
        if not wallet_address:
            raise HTTPException(status_code=400, detail="Wallet address is required")
        
        # Get current user from database
        current_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not current_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if wallet address is already linked to another user
        existing_user = db.query(models.User).filter(
            models.User.wallet_address == wallet_address,
            models.User.id != user_id
        ).first()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="This wallet address is already linked to another account")
        
        # Update current user's wallet address
        current_user.wallet_address = wallet_address
        db.commit()
        db.refresh(current_user)
        
        return {"id": current_user.id, "username": current_user.username, "is_admin": current_user.is_admin, "wallet_address": current_user.wallet_address}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update wallet address: {str(e)}")