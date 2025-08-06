from web3 import Web3
from web3.providers import HTTPProvider
import json
import os
from services.config import settings
from sqlalchemy.orm import Session
from eth_account import Account
import hashlib
from services.models import User

# Initialize Web3 connection
w3 = Web3(HTTPProvider(settings.BLOCKCHAIN_RPC_URL))

# Validate connection
if not w3.is_connected():
    raise ConnectionError(f"Failed to connect to blockchain at {settings.BLOCKCHAIN_RPC_URL}")

# Initialize account and contracts
ACCOUNT = w3.eth.account.from_key(settings.INITOWNER_PRIVATE_KEY)
TRADE_MANAGER_ADDRESS = w3.to_checksum_address(settings.TRADE_MANAGER_ADDRESS)
SWINGOLD_ADDRESS = w3.to_checksum_address(settings.SWINGOLD_ADDRESS)

# Load contract ABIs
try:
    with open(os.path.join(settings.ABI_OUTPUT_DIR, "TradeManagerABI.json"), "r") as f:
        trade_abi = json.load(f)
    with open(os.path.join(settings.ABI_OUTPUT_DIR, "SwingoldABI.json"), "r") as f:
        token_abi = json.load(f)
except FileNotFoundError as e:
    raise FileNotFoundError(f"ABI file not found: {e}")

# Initialize contract instances
trade_contract = w3.eth.contract(address=TRADE_MANAGER_ADDRESS, abi=trade_abi)
token_contract = w3.eth.contract(address=SWINGOLD_ADDRESS, abi=token_abi)

def create_trade(seller: str, item_name: str, item_category: str, price: int) -> str:
    """
    Create a trade on the blockchain
    Args:
        seller: Seller's wallet address
        item_name: Name of the item being traded
        item_category: Category of the item
        price: Price in token smallest unit (wei)
    Returns:
        Transaction hash
    """
    try:
        nonce = w3.eth.get_transaction_count(ACCOUNT.address)
        
        # Build transaction
        txn = trade_contract.functions.createTrade(
            w3.to_checksum_address(seller),
            item_name,
            item_category,
            price
        ).build_transaction({
            "from": ACCOUNT.address,
            "nonce": nonce,
            "gas": 3000000,
            "gasPrice": w3.to_wei("20", "gwei")
        })
        
        # Sign and send transaction
        signed = w3.eth.account.sign_transaction(txn, settings.INITOWNER_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        return tx_hash.hex()
    except Exception as e:
        raise Exception(f"Failed to create trade: {str(e)}")

def confirm_trade(item_name: str) -> str:
    """
    Confirm a trade on the blockchain
    Args:
        item_name: Name of the item being traded
    Returns:
        Transaction hash
    """
    try:
        nonce = w3.eth.get_transaction_count(ACCOUNT.address)
        
        # Build transaction
        txn = trade_contract.functions.confirmTrade(item_name).build_transaction({
            "from": ACCOUNT.address,
            "nonce": nonce,
            "gas": 3000000,
            "gasPrice": w3.to_wei("20", "gwei")
        })
        
        # Sign and send transaction
        signed = w3.eth.account.sign_transaction(txn, settings.INITOWNER_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        return tx_hash.hex()
    except Exception as e:
        raise Exception(f"Failed to confirm trade: {str(e)}")

def cancel_trade(item_name: str) -> str:
    """
    Cancel a trade on the blockchain
    Args:
        item_name: Name of the item being traded
    Returns:
        Transaction hash
    """
    try:
        nonce = w3.eth.get_transaction_count(ACCOUNT.address)
        
        # Build transaction
        txn = trade_contract.functions.cancelTrade(item_name).build_transaction({
            "from": ACCOUNT.address,
            "nonce": nonce,
            "gas": 3000000,
            "gasPrice": w3.to_wei("20", "gwei")
        })
        
        # Sign and send transaction
        signed = w3.eth.account.sign_transaction(txn, settings.INITOWNER_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        return tx_hash.hex()
    except Exception as e:
        raise Exception(f"Failed to cancel trade: {str(e)}")

def get_balance(address: str) -> int:
    """
    Get Swingold token balance for an address
    Args:
        address: Wallet address to check
    Returns:
        Balance in token smallest unit (wei)
    """
    try:
        return token_contract.functions.balanceOf(w3.to_checksum_address(address)).call()
    except Exception as e:
        raise Exception(f"Failed to get balance: {str(e)}")

def mint_tokens(to_address: str, amount: int) -> str:
    """
    Mint Swingold tokens to an address (owner only)
    Args:
        to_address: Address to mint tokens to
        amount: Amount in token smallest unit (wei)
    Returns:
        Transaction hash
    """
    try:
        nonce = w3.eth.get_transaction_count(ACCOUNT.address)
        
        # Build transaction
        txn = token_contract.functions.mint(
            w3.to_checksum_address(to_address),
            amount
        ).build_transaction({
            "from": ACCOUNT.address,
            "nonce": nonce,
            "gas": 3000000,
            "gasPrice": w3.to_wei("20", "gwei")
        })
        
        # Sign and send transaction
        signed = w3.eth.account.sign_transaction(txn, settings.INITOWNER_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        return tx_hash.hex()
    except Exception as e:
        raise Exception(f"Failed to mint tokens: {str(e)}")

def get_trade_info(item_name: str) -> dict:
    """
    Get trade information from the blockchain
    Args:
        item_name: Name of the item
    Returns:
        Trade information dictionary
    """
    try:
        trade_info = trade_contract.functions.trades(item_name).call()
        return {
            "buyer": trade_info[0],
            "seller": trade_info[1],
            "itemName": trade_info[2],
            "itemCategory": trade_info[3],
            "itemPrice": trade_info[4],
            "createdAt": trade_info[5],
            "confirmed": trade_info[6],
            "completed": trade_info[7]
        }
    except Exception as e:
        raise Exception(f"Failed to get trade info: {str(e)}")

def ensure_wallet_exists_for_user(db: Session, user: User) -> User:
    """
    Ensure a user has a wallet address, create one if not
    Args:
        db: Database session
        user: User object
    Returns:
        Updated user object
    """
    if user.wallet_address:
        return user

    # Create new wallet
    acct = Account.create()
    user.wallet_address = acct.address
    
    db.commit()
    db.refresh(user)
    return user

# Deprecated function - kept for backward compatibility
def create_wallet_and_insert(db: Session, username: str, email: str):
    """
    Create a new user with wallet (deprecated)
    Use ensure_wallet_exists_for_user instead
    """
    acct = Account.create()
    wallet_address = acct.address

    user = User(
        username=username,
        email=email,
        wallet_address=wallet_address,
        password_hash=hashlib.sha256(b"default").hexdigest(),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user