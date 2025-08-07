import pytest
from fastapi.testclient import TestClient

def test_send_gold(client, sample_user, admin_user):
    transfer_data = {
        "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        "amount": 50.0,
        "tx_hash": "0xtransfer123"
    }
    response = client.post("/api/v1/transfers/send",
                          json=transfer_data,
                          headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 50.0

def test_send_gold_to_self(client, sample_user):
    transfer_data = {
        "recipient_address": "0x1234567890123456789012345678901234567890",
        "amount": 50.0,
        "tx_hash": "0xtransfer123"
    }
    response = client.post("/api/v1/transfers/send",
                          json=transfer_data,
                          headers={"X-User-Id": str(sample_user.id)})
    # Since we removed self-send validation, this should now succeed
    assert response.status_code == 201

def test_send_gold_invalid_address(client, sample_user):
    transfer_data = {
        "recipient_address": "0xinvalid",
        "amount": 50.0,
        "tx_hash": "0xtransfer123"
    }
    response = client.post("/api/v1/transfers/send",
                          json=transfer_data,
                          headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 400
    assert "Invalid recipient address format" in response.json()["detail"]

def test_get_transfer_history(client, sample_user):
    response = client.get(f"/api/v1/transfers/history/{sample_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
