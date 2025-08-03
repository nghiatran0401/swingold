# init_owner.py

from eth_account import Account
import os
import json
import pymysql
from dotenv import load_dotenv

load_dotenv()

# 1. Generate the wallet
acct = Account.create()
wallet_address = acct.address
private_key = acct.key.hex()

print("Generated Initial Owner Wallet:")
print(f"Address: {wallet_address}")
print(f"Private Key: {private_key}")

# # 2. Insert into MySQL
# conn = pymysql.connect(
#     host=os.getenv("DB_HOST", "localhost"),
#     user=os.getenv("DB_USER", "swe"),
#     password=os.getenv("DB_PASSWORD", "password"),
#     database=os.getenv("DB_NAME", "swingold"),
#     port=int(os.getenv("DB_PORT", 3306))
# )
#
#
# try:
#     with conn.cursor() as cursor:
#         cursor.execute("""
#             INSERT INTO users (username, email, wallet_address, private_key, password_hash, is_admin)
#             VALUES (%s, %s, %s, %s, %s, %s)
#         """, ("initial_owner", "initial@admin.com", wallet_address, private_key, "hashed_or_dummy_pw", True))
#     conn.commit()
#     print("Initial owner inserted into database.")
# finally:
#     conn.close()
