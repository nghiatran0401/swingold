import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from services.database import get_db, Base
from main import app
import services.models as models
from datetime import datetime

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop tables
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    from main import app
    from services.database import get_db
    
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    return app

@pytest.fixture
def admin_user(db):
    user = models.User(
        username="admin",
        email="admin@swinburne.edu.au",
        password_hash="cos30049",
        is_active=True,
        is_admin=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def sample_user(db):
    user = models.User(
        username="user1",
        email="user1@swinburne.edu.au",
        password_hash="cos30049",
        is_active=True,
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def sample_item(db):
    item = models.Item(
        name="Test Item",
        description="A test item",
        price=100.0,
        status=models.ItemEventStatusEnum.active
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@pytest.fixture
def sample_event(db):
    from datetime import datetime
    event = models.Event(
        name="Test Event",
        description="A test event",
        start_datetime=datetime(2025, 1, 1, 10, 0, 0),
        price=0.0,
        status=models.ItemEventStatusEnum.upcoming
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@pytest.fixture
def sample_transaction(db_session, sample_user):
    transaction = models.Transaction(
        amount=100.0,
        direction=models.DirectionEnum.debit,
        tx_hash="0xtest123",
        description="Test transaction",
        status=models.StatusEnum.confirmed,
        user_id=sample_user.id
    )
    db_session.add(transaction)
    db_session.commit()
    db_session.refresh(transaction)
    return transaction
