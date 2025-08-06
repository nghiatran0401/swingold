import pytest
from fastapi.testclient import TestClient

def test_create_trade_onchain(client, sample_user, admin_user):
    response = client.post(
        "/transactions/onchain/create",
        params={
            "buyer": "0x1234567890123456789012345678901234567890",
            "seller": "0x0987654321098765432109876543210987654321",
            "item_name": "Test Item",
            "item_category": "Electronics",
            "item_price": 1000000000000000000
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "tx_hash" in data
    assert "transaction_id" in data

def test_confirm_trade_onchain(client):
    response = client.post(
        "/transactions/onchain/confirm",
        params={
            "item_name": "Test Item",
            "buyer": "0x1234567890123456789012345678901234567890"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "tx_hash" in data
    assert "transaction_id" in data

def test_cancel_trade_onchain(client):
    response = client.post(
        "/transactions/onchain/cancel",
        params={
            "item_name": "Test Item",
            "buyer": "0x1234567890123456789012345678901234567890"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "tx_hash" in data
    assert "transaction_id" in data

def test_record_onchain_purchase(client, sample_user, sample_item):
    response = client.post(
        "/transactions/onchain/purchase",
        json={
            "user_id": sample_user.id,
            "item_id": sample_item.id,
            "price": 1000000000000000000,
            "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            "quantity": 1
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["user_id"] == sample_user.id
    assert data["item_id"] == sample_item.id

def test_record_event_registration(client, sample_user, sample_event):
    response = client.post(
        "/transactions/onchain/event-registration",
        json={
            "user_id": sample_user.id,
            "event_id": sample_event.id,
            "amount": 500000000000000000,
            "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["user_id"] == sample_user.id
    assert data["event_id"] == sample_event.id

def test_record_transfer(client, sample_user):
    response = client.post(
        "/transactions/onchain/transfer",
        json={
            "user_id": sample_user.id,
            "amount": 1000000000000000000,
            "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            "recipient_address": "0x0987654321098765432109876543210987654321"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["user_id"] == sample_user.id

def test_get_onchain_balance(client):
    response = client.get("/transactions/onchain/balance/0x1234567890123456789012345678901234567890")
    assert response.status_code == 200
    data = response.json()
    assert "balance" in data

def test_get_trade_info(client):
    response = client.get("/transactions/onchain/trade/Test Item")
    assert response.status_code == 200

def test_mint_tokens_onchain(client):
    response = client.post(
        "/transactions/onchain/mint",
        params={
            "to_address": "0x1234567890123456789012345678901234567890",
            "amount": 1000000000000000000
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "tx_hash" in data
    assert "transaction_id" in data

def test_get_user_transaction_history(client, sample_user):
    response = client.get(f"/transactions/onchain/user/{sample_user.id}/history")
    assert response.status_code == 200
    data = response.json()
    assert "transactions" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data
