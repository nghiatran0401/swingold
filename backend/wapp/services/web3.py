from web3 import Web3
from dotenv import load_dotenv
import json
import os

load_dotenv()

PRIVATE_KEY = os.getenv("PRIVATE_KEY")
w3 = Web3(Web3.HTTPProvider(os.getenv("BLOCKCHAIN_RPC_URL")))
TRADE_MANAGER_ADDRESS = Web3.to_checksum_address(os.getenv("TRADE_MANAGER_ADDRESS"))
TOKEN_ADDRESS = Web3.to_checksum_address(os.getenv("TOKEN_ADDRESS"))
ACCOUNT = w3.eth.account.from_key(PRIVATE_KEY)

ABI_OUTPUT_DIR = os.getenv("ABI_OUTPUT_DIR", "/app/shared-abis")
with open(os.path.join(ABI_OUTPUT_DIR, "TradeManagerABI.json"), "r") as f:
    trade_abi = json.load(f)
with open(os.path.join(ABI_OUTPUT_DIR, "TokenABI.json"), "r") as f:
    token_abi = json.load(f)
    
trade_contract = w3.eth.contract(address=TRADE_MANAGER_ADDRESS, abi=trade_abi)
token_contract = w3.eth.contract(address=TOKEN_ADDRESS, abi=token_abi)


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
    signed = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
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
    signed = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    return tx_hash.hex()

def get_balance(address: str) -> int:
    return token_contract.functions.balanceOf(Web3.to_checksum_address(address)).call()