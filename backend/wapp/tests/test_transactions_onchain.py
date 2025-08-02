import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

@patch('routers.transactions_onchain.create_trade')
def test_create_trade_onchain(mock_create_trade, client, sample_user, admin_user):
    mock_create_trade.return_value = "0xtest123"
    
    response = client.post("/api/v1/transactions/onchain/create",
                          params={
                              "buyer": sample_user.wallet_address,
                              "seller": admin_user.wallet_address,
                              "item_name": "Test Item",
                              "item_price": 100
                          })
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["txn"] == "0xtest123"

@patch('routers.transactions_onchain.confirm_trade')
def test_confirm_trade_onchain(mock_confirm_trade, client, sample_user):
    mock_confirm_trade.return_value = "0xconfirm123"
    
    response = client.post("/api/v1/transactions/onchain/confirm/1",
                          params={"buyer": sample_user.wallet_address})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["txn"] == "0xconfirm123"

def test_record_onchain_purchase(client, sample_user):
    purchase_data = {
        "wallet_address": sample_user.wallet_address,
        "price": 100,
        "item_id": 1,
        "tx_hash": "0xpurchase123",
        "quantity": 1
    }
    response = client.post("/api/v1/transactions/onchain/purchase",
                          json=purchase_data)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 100
    assert data["tx_hash"] == "0xpurchase123"

@patch('routers.transactions_onchain.get_balance')
def test_get_onchain_balance(mock_get_balance, client):
    mock_get_balance.return_value = 1000000000000000000
    
    response = client.get("/api/v1/transactions/onchain/balance/0x1234")
    assert response.status_code == 200
    data = response.json()
    assert data["address"] == "0x1234"
    assert data["balance"] == 1000000000000000000
