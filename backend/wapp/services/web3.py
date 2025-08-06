from web3 import Web3
from web3.providers import HTTPProvider
import json
import os
from services.config import settings
from eth_account import Account

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

def create_trade(seller: str, item_name: str, item_category: str, price: int) -> str:
    """
    Create a trade on the blockchain
    Args:
        seller: Seller's wallet address
        item_name: Name of the item
        item_category: Category of the item
        price: Price in token smallest unit (wei)
    Returns:
        Transaction hash
    """
    try:
        nonce = w3.eth.get_transaction_count(ACCOUNT.address)
        
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
        
        signed = w3.eth.account.sign_transaction(txn, settings.INITOWNER_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        return tx_hash.hex()
    except Exception as e:
        raise Exception(f"Failed to create trade: {str(e)}")

def confirm_trade(item_name: str) -> str:
    """
    Confirm a trade on the blockchain
    Args:
        item_name: Name of the item to confirm
    Returns:
        Transaction hash
    """
    try:
        nonce = w3.eth.get_transaction_count(ACCOUNT.address)
        
        txn = trade_contract.functions.confirmTrade(item_name).build_transaction({
            "from": ACCOUNT.address,
            "nonce": nonce,
            "gas": 3000000,
            "gasPrice": w3.to_wei("20", "gwei")
        })
        
        signed = w3.eth.account.sign_transaction(txn, settings.INITOWNER_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        return tx_hash.hex()
    except Exception as e:
        raise Exception(f"Failed to confirm trade: {str(e)}")

def cancel_trade(item_name: str) -> str:
    """
    Cancel a trade on the blockchain
    Args:
        item_name: Name of the item to cancel
    Returns:
        Transaction hash
    """
    try:
        nonce = w3.eth.get_transaction_count(ACCOUNT.address)
        
        txn = trade_contract.functions.cancelTrade(item_name).build_transaction({
            "from": ACCOUNT.address,
            "nonce": nonce,
            "gas": 3000000,
            "gasPrice": w3.to_wei("20", "gwei")
        })
        
        signed = w3.eth.account.sign_transaction(txn, settings.INITOWNER_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        return tx_hash.hex()
    except Exception as e:
        raise Exception(f"Failed to cancel trade: {str(e)}")

def get_trade_info(item_name: str) -> dict:
    """
    Get trade information for a specific item
    Args:
        item_name: Name of the item
    Returns:
        Trade information dictionary
    """
    try:
        trade_info = trade_contract.functions.getTradeInfo(item_name).call()
        return {
            "seller": trade_info[0],
            "buyer": trade_info[1],
            "item_name": trade_info[2],
            "item_category": trade_info[3],
            "price": trade_info[4],
            "status": trade_info[5]
        }
    except Exception as e:
        raise Exception(f"Failed to get trade info: {str(e)}")

def get_transaction_details(tx_hash: str) -> dict:
    """
    Get transaction details from blockchain
    Args:
        tx_hash: Transaction hash
    Returns:
        Transaction details dictionary
    """
    try:
        tx_receipt = w3.eth.get_transaction_receipt(tx_hash)
        tx = w3.eth.get_transaction(tx_hash)
        
        return {
            "block_number": tx_receipt.blockNumber,
            "gas_used": tx_receipt.gasUsed,
            "gas_price": tx.gasPrice,
            "status": "confirmed" if tx_receipt.status == 1 else "failed",
            "from": tx.from_address,
            "to": tx.to,
            "value": tx.value
        }
    except Exception as e:
        raise Exception(f"Failed to get transaction details: {str(e)}")

def sync_transaction_status(tx_hash: str, transaction) -> None:
    """
    Sync transaction status from blockchain to database transaction object
    Args:
        tx_hash: Transaction hash
        transaction: Database transaction object to update
    """
    try:
        tx_receipt = w3.eth.get_transaction_receipt(tx_hash)
        tx = w3.eth.get_transaction(tx_hash)
        
        transaction.status = "confirmed" if tx_receipt.status == 1 else "failed"
        transaction.block_number = tx_receipt.blockNumber
        transaction.gas_used = tx_receipt.gasUsed
        transaction.gas_price = tx.gasPrice
        transaction.mined_at = w3.eth.get_block(tx_receipt.blockNumber).timestamp
    except Exception as e:
        raise Exception(f"Failed to sync transaction status: {str(e)}")

def get_web3_service():
    """Factory function to get web3 service instance"""
    return Web3Service()

class Web3Service:
    """Web3 service class for blockchain interactions"""
    
    def get_balance(self, address: str) -> int:
        return get_balance(address)
    
    def mint_tokens(self, to_address: str, amount: int) -> str:
        return mint_tokens(to_address, amount)
    
    def create_trade(self, seller: str, item_name: str, item_category: str, price: int) -> str:
        return create_trade(seller, item_name, item_category, price)
    
    def confirm_trade(self, item_name: str) -> str:
        return confirm_trade(item_name)
    
    def cancel_trade(self, item_name: str) -> str:
        return cancel_trade(item_name)
    
    def get_trade_info(self, item_name: str) -> dict:
        return get_trade_info(item_name)
    
    def get_transaction_details(self, tx_hash: str) -> dict:
        return get_transaction_details(tx_hash)
    
    def sync_transaction_status(self, tx_hash: str, transaction) -> None:
        return sync_transaction_status(tx_hash, transaction)