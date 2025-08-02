import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

def test_request_wallet_challenge(client):
    response = client.post("/api/v1/request-wallet-challenge", json={
        "address": "0x1234567890123456789012345678901234567890"
    })
    assert response.status_code == 200
    data = response.json()
    assert "challenge" in data
    assert "Please sign this message" in data["challenge"]

def test_request_wallet_challenge_missing_address(client):
    response = client.post("/api/v1/request-wallet-challenge", json={})
    assert response.status_code == 400
    assert "Wallet address is required" in response.json()["detail"]

@patch('routers.profile.Account.recover_message')
def test_verify_wallet_signature_success(mock_recover, client):
    mock_recover.return_value = "0x1234567890123456789012345678901234567890"
    
    client.post("/api/v1/request-wallet-challenge",
               json={"address": "0x1234567890123456789012345678901234567890"})
    
    response = client.post("/api/v1/verify-wallet-signature",
                          json={
                              "address": "0x1234567890123456789012345678901234567890",
                              "signature": "0xsignature123"
                          })
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] == True

def test_update_wallet_address(client, sample_user):
    response = client.patch("/api/v1/update-wallet-address",
                           json={"wallet_address": "0xnewaddress123456789012345678901234567890"},
                           headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 200
    data = response.json()
    assert data["wallet_address"] == "0xnewaddress123456789012345678901234567890"

def test_update_wallet_address_duplicate(client, sample_user, admin_user):
    response = client.patch("/api/v1/update-wallet-address",
                           json={"wallet_address": admin_user.wallet_address},
                           headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 400
    assert "already linked to another account" in response.json()["detail"]
