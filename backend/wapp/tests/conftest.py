import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from services.database import get_db, Base
from main import app
import services.models as models
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def sample_user(db_session):
    user = models.User(
        username="testuser",
        email="test@example.com",
        password_hash="testpass",
        wallet_address="0x1234567890123456789012345678901234567890",
        is_admin=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def admin_user(db_session):
    user = models.User(
        username="admin",
        email="admin@example.com",
        password_hash="adminpass",
        wallet_address="0x0987654321098765432109876543210987654321",
        is_admin=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def sample_item(db_session):
    item = models.Item(
        name="Test Item",
        description="Test Description",
        price=100.0,
        image_url="test.jpg",
        tags="test,item",
        status=models.ItemEventStatusEnum.active
    )
    db_session.add(item)
    db_session.commit()
    db_session.refresh(item)
    return item

@pytest.fixture
def sample_event(db_session):
    event = models.Event(
        name="Test Event",
        description="Test Event Description",
        category="Test",
        start_datetime=datetime(2025, 12, 1, 10, 0, 0),
        end_datetime=datetime(2025, 12, 1, 12, 0, 0),
        price=50.0,
        location="Test Location",
        seats_available=100,
        status=models.ItemEventStatusEnum.upcoming
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
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
