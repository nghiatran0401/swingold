from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from services.database import get_db 
from services import models 
from routers import auth

router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={404: {"description": "Not found"}},
)

"""Get all items"""
@router.get("/")
def read_items(db: Session = Depends(get_db)):
    items = db.query(models.Item).all()
    return items

"""Create a new item, function for admin"""
@router.post("/")
def create_item(item, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        db_item = models.Item(**item.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create item: {str(e)}"
        )

"""Update an existing item, function for admin"""
@router.put("/{item_id}")
def update_item(item_id: int, item_update, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Item not found"
        )
    try:
        update_data = item_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
        return db_item
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update item: {str(e)}"
        )

"""Delete an existing item, function for admin"""
@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Item not found"
        )
    try:
        db.delete(db_item)
        db.commit()
        return {"message": "Item deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete item: {str(e)}"
        )