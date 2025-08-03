from web3 import Web3
import json
import os
from services.config import settings
from eth_account import Account
from sqlalchemy.orm import Session
from .models import User

w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_RPC_URL))
ACCOUNT = w3.eth.account.from_key(settings.PRIVATE_KEY)
TRADE_MANAGER_ADDRESS = Web3.to_checksum_address(settings.TRADE_MANAGER_ADDRESS)
SWINGOLD_ADDRESS = Web3.to_checksum_address(settings.SWINGOLD_ADDRESS)

with open(os.path.join(settings.ABI_OUTPUT_DIR, "TradeManagerABI.json"), "r") as f:
    trade_abi = json.load(f)
with open(os.path.join(settings.ABI_OUTPUT_DIR, "SwingoldABI.json"), "r") as f:
    token_abi = json.load(f)
    
# Contract instances
trade_contract = w3.eth.contract(address=TRADE_MANAGER_ADDRESS, abi=trade_abi)
token_contract = w3.eth.contract(address=SWINGOLD_ADDRESS, abi=token_abi)

# Trade creation
def create_trade(seller: str, item_name: str, price: int) -> str:
    nonce = w3.eth.get_transaction_count(ACCOUNT.address)
    txn = trade_contract.functions.createTrade(
        Web3.to_checksum_address(seller),
        item_name,
        price
    ).build_transaction({
        "from": ACCOUNT.address,
        "nonce": nonce,
        "gas": 3000000,
        "gasPrice": w3.to_wei("20", "gwei")
    })
    signed = w3.eth.account.sign_transaction(txn, settings.PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    return tx_hash.hex()

# Trade confirmation
def confirm_trade(trade_id: int) -> str:
    nonce = w3.eth.get_transaction_count(ACCOUNT.address)
    txn = trade_contract.functions.confirmTrade(trade_id).build_transaction({
        "from": ACCOUNT.address,
        "nonce": nonce,
        "gas": 3000000,
        "gasPrice": w3.to_wei("20", "gwei")
    })
    signed = w3.eth.account.sign_transaction(txn, settings.PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    return tx_hash.hex()

# Get token balance (in SG)
def get_balance(address: str) -> int:
    return token_contract.functions.balanceOf(Web3.to_checksum_address(address)).call()

def create_wallet_and_insert(db: Session, username: str, email: str):
    acct = Account.create()
    wallet_address = acct.address
    private_key = acct.key.hex()

    user = User(
        username=username,
        email=email,
        wallet_address=wallet_address,
        private_key=private_key,
        password_hash=hashlib.sha256(b"default").hexdigest(),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user