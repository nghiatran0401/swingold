from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.database import get_db
import services.models as models
<<<<<<< Updated upstream
=======
from pydantic import BaseModel
from services.web3 import ensure_wallet_exists_for_user
>>>>>>> Stashed changes

router = APIRouter()

@router.post("/login")
def get_current_user(user: dict, db: Session = Depends(get_db)):
    username = user.get('username')
    password = user.get('password')
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    
<<<<<<< Updated upstream
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if not db_user or password != db_user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"id": db_user.id, "username": db_user.username, "is_admin": db_user.is_admin, "wallet_address": db_user.wallet_address}
=======
    if user.password != db_user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    db_user = ensure_wallet_exists_for_user(db, db_user) #check if wallet exist

    return {
        "id": db_user.id, 
        "username": db_user.username, 
        "email": db_user.email,
        "is_admin": db_user.is_admin, 
        "wallet_address": db_user.wallet_address
    }
>>>>>>> Stashed changes
