import pytest
from fastapi.testclient import TestClient

def test_get_transactions(client, sample_transaction, sample_user):
    response = client.get(f"/api/v1/transactions?user_id={sample_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["amount"] == 100.0
    assert data[0]["direction"] == "debit"

def test_get_transactions_with_pagination(client, sample_transaction, sample_user):
    response = client.get(f"/api/v1/transactions?user_id={sample_user.id}&skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 10

def test_create_purchase_transaction(client, sample_user, sample_item):
    transaction_data = {
        "amount": 100.0,
        "direction": "debit",
        "tx_hash": "0xpurchase123",
        "description": "Item purchase",
        "user_id": sample_user.id,
        "item_id": sample_item.id
    }
    response = client.post("/api/v1/transactions/purchase",
                          json=transaction_data,
                          headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 100.0
    assert data["direction"] == "debit"

def test_create_earn_transaction(client, sample_user, sample_event):
    transaction_data = {
        "amount": 50.0,
        "direction": "credit",
        "tx_hash": "0xearn123",
        "description": "Event participation reward",
        "user_id": sample_user.id,
        "event_id": sample_event.id
    }
    response = client.post("/api/v1/transactions/earn",
                          json=transaction_data,
                          headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 50.0
    assert data["direction"] == "credit"
