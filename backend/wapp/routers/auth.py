from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.database import get_db
import services.models as models

router = APIRouter()

@router.post("/login")
def get_current_user(user: dict, db: Session = Depends(get_db)):
    username = user.get('username')
    password = user.get('password')
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if not db_user or password != db_user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"id": db_user.id, "username": db_user.username, "is_admin": db_user.is_admin, "wallet_address": db_user.wallet_address}