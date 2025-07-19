from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from services.database import get_db 
import services.models as models 
import services.schemas as schemas

router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=list[schemas.ItemOut])
def read_items(db: Session = Depends(get_db)):
    return db.query(models.Item).all()


@router.post("/", response_model=schemas.ItemOut)
def create_item(
    item: schemas.ItemCreate,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        db_item = models.Item(**item.dict())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create item: {str(e)}"
        )


@router.put("/{item_id}", response_model=schemas.ItemOut)
def update_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    try:
        update_data = item_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
        return db_item
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update item: {str(e)}"
        )


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    try:
        db.delete(db_item)
        db.commit()
        return {"message": "Item deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete item: {str(e)}"
        )
