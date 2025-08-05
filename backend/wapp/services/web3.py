from web3 import Web3
from web3.providers import HTTPProvider
import json
import os
from services.config import settings

w3 = Web3(HTTPProvider(settings.BLOCKCHAIN_RPC_URL))
ACCOUNT = w3.eth.account.from_key(settings.INITOWNER_PRIVATE_KEY)
TRADE_MANAGER_ADDRESS = w3.to_checksum_address(settings.TRADE_MANAGER_ADDRESS)
SWINGOLD_ADDRESS = w3.to_checksum_address(settings.SWINGOLD_ADDRESS)

with open(os.path.join(settings.ABI_OUTPUT_DIR, "TradeManagerABI.json"), "r") as f:
    trade_abi = json.load(f)
with open(os.path.join(settings.ABI_OUTPUT_DIR, "SwingoldABI.json"), "r") as f:
    token_abi = json.load(f)
    
trade_contract = w3.eth.contract(address=TRADE_MANAGER_ADDRESS, abi=trade_abi)
token_contract = w3.eth.contract(address=SWINGOLD_ADDRESS, abi=token_abi)

def create_trade(seller: str, item_name: str, price: int) -> str:
    nonce = w3.eth.get_transaction_count(ACCOUNT.address)
    txn = trade_contract.functions.createTrade(
        w3.to_checksum_address(seller),
        item_name,
        price
    ).build_transaction({
        "from": ACCOUNT.address,
        "nonce": nonce,
        "gas": 3000000,
        "gasPrice": w3.to_wei("20", "gwei")
    })
    signed = w3.eth.account.sign_transaction(txn, settings.INITOWNER_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    return tx_hash.hex()

def confirm_trade(trade_id: int) -> str:
    nonce = w3.eth.get_transaction_count(ACCOUNT.address)
    txn = trade_contract.functions.confirmTrade(trade_id).build_transaction({
        "from": ACCOUNT.address,
        "nonce": nonce,
        "gas": 3000000,
        "gasPrice": w3.to_wei("20", "gwei")
    })
    signed = w3.eth.account.sign_transaction(txn, settings.INITOWNER_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    return tx_hash.hex()

def get_balance(address: str) -> int:
    return token_contract.functions.balanceOf(w3.to_checksum_address(address)).call()

def ensure_wallet_exists_for_user(db: Session, user: User) -> User:
    if user.wallet_address and hasattr(user, 'private_key') and user.private_key:
        return user

    acct = Account.create()
    user.wallet_address = acct.address
    user.private_key = acct.key.hex()

    db.commit()
    db.refresh(user)
    return user

# This function creates new user, updated to mark as deprecated
# Only use this if you're inserting brand new users manually
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