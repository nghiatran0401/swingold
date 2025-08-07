"""
Transaction Service - Handles hybrid blockchain/database transaction recording
"""
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, Dict, Any
import services.models as models


class TransactionService:
    """
    Service for managing transactions with hybrid blockchain/database approach.
    
    Strategy:
    1. Record essential metadata in database for fast queries
    2. Use blockchain as source of truth for transaction details
    3. Periodically sync blockchain data to database
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def record_item_purchase(
        self,
        user_id: int,
        item_id: int,
        amount: float,
        tx_hash: str,
        **kwargs
    ) -> models.Transaction:
        """
        Record an item purchase transaction.
        """
        transaction = models.Transaction(
            amount=amount,
            direction=models.DirectionEnum.debit,
            tx_hash=tx_hash,
            description=f"Item purchase - tx: {tx_hash}",
            status=models.StatusEnum.confirmed,  # Transactions are recorded after blockchain confirmation
            user_id=user_id,
            item_id=item_id,
            trade_type="item_purchase",
            created_at=datetime.utcnow()
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def record_event_registration(
        self,
        user_id: int,
        event_id: int,
        amount: float,
        tx_hash: str,
        **kwargs
    ) -> models.Transaction:
        """
        Record an event registration transaction (user earns Swingold).
        """
        transaction = models.Transaction(
            amount=amount,
            direction=models.DirectionEnum.credit,  # User earns tokens
            tx_hash=tx_hash,
            description=f"Event registration reward - tx: {tx_hash}",
            status=models.StatusEnum.confirmed,  # Transactions are recorded after blockchain confirmation
            user_id=user_id,
            event_id=event_id,
            trade_type="event_registration",
            created_at=datetime.utcnow()
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def record_transfer(
        self,
        user_id: int,
        amount: str,
        tx_hash: str,
        recipient_address: str,
        **kwargs
    ) -> models.Transaction:
        """
        Record a Swingold transfer transaction.
        """
        # Store amount as string to handle large wei values
        transaction = models.Transaction(
            amount=amount,  # Store as string
            direction=models.DirectionEnum.debit,  # User sends tokens
            tx_hash=tx_hash,
            description=f"Transfer to {recipient_address[:8]}... - tx: {tx_hash}",
            status=models.StatusEnum.confirmed,  # Transactions are recorded after blockchain confirmation
            user_id=user_id,
            trade_type="transfer",
            counterparty_address=recipient_address,
            created_at=datetime.utcnow()
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def record_trade_creation(
        self,
        buyer_address: str,
        seller_address: str,
        item_name: str,
        item_category: str,
        amount: float,
        tx_hash: str,
        **kwargs
    ) -> models.Transaction:
        """
        Record a trade creation transaction.
        """
        transaction = models.Transaction(
            amount=amount,
            direction=models.DirectionEnum.debit,
            tx_hash=tx_hash,
            description=f"Trade creation for {item_name} - tx: {tx_hash}",
            status=models.StatusEnum.confirmed,  # Transactions are recorded after blockchain confirmation
            trade_type="trade_creation",
            counterparty_address=seller_address,
            item_name=item_name,
            item_category=item_category,
            created_at=datetime.utcnow()
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def record_trade_confirmation(
        self,
        buyer_address: str,
        item_name: str,
        tx_hash: str,
        **kwargs
    ) -> models.Transaction:
        """
        Record a trade confirmation transaction.
        """
        transaction = models.Transaction(
            amount=0,
            direction=models.DirectionEnum.debit,
            tx_hash=tx_hash,
            description=f"Trade confirmation for {item_name} - tx: {tx_hash}",
            status=models.StatusEnum.confirmed,  # Transactions are recorded after blockchain confirmation
            trade_type="trade_confirmation",
            item_name=item_name,
            created_at=datetime.utcnow()
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def record_trade_cancellation(
        self,
        buyer_address: str,
        item_name: str,
        tx_hash: str,
        **kwargs
    ) -> models.Transaction:
        """
        Record a trade cancellation transaction.
        """
        transaction = models.Transaction(
            amount=0,
            direction=models.DirectionEnum.credit,
            tx_hash=tx_hash,
            description=f"Trade cancellation for {item_name} - tx: {tx_hash}",
            status=models.StatusEnum.confirmed,  # Transactions are recorded after blockchain confirmation
            trade_type="trade_cancellation",
            item_name=item_name,
            created_at=datetime.utcnow()
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def record_token_minting(
        self,
        to_address: str,
        amount: float,
        tx_hash: str,
        **kwargs
    ) -> models.Transaction:
        """
        Record a token minting transaction.
        """
        transaction = models.Transaction(
            amount=amount,
            direction=models.DirectionEnum.credit,
            tx_hash=tx_hash,
            description=f"Token minting to {to_address[:8]}... - tx: {tx_hash}",
            status=models.StatusEnum.confirmed,  # Transactions are recorded after blockchain confirmation
            trade_type="token_minting",
            counterparty_address=to_address,
            created_at=datetime.utcnow()
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def record_p2p_trade(
        self,
        user_id: int,
        amount: float,
        tx_hash: str,
        item_name: str,
        item_category: str,
        counterparty_address: str,
        trade_type: str = "p2p_trade",
        **kwargs
    ) -> models.Transaction:
        """
        Record a P2P trade transaction.
        """
        transaction = models.Transaction(
            amount=amount,
            direction=models.DirectionEnum.debit,
            tx_hash=tx_hash,
            description=f"P2P trade: {item_name} - tx: {tx_hash}",
            status=models.StatusEnum.confirmed,  # Transactions are recorded after blockchain confirmation
            user_id=user_id,
            trade_type=trade_type,
            item_name=item_name,
            item_category=item_category,
            counterparty_address=counterparty_address,
            created_at=datetime.utcnow()
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def update_transaction_from_blockchain(
        self,
        tx_hash: str,
        block_number: Optional[int] = None,
        gas_used: Optional[int] = None,
        gas_price: Optional[int] = None,
        status: str = "confirmed"
    ) -> models.Transaction:
        """
        Update transaction with blockchain data after mining.
        """
        transaction = self.db.query(models.Transaction).filter(
            models.Transaction.tx_hash == tx_hash
        ).first()
        
        if transaction:
            transaction.status = models.StatusEnum(status)
            transaction.block_number = block_number
            transaction.gas_used = gas_used
            transaction.gas_price = gas_price
            transaction.mined_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(transaction)
        
        return transaction
    
    def get_user_transaction_history(
        self,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
        trade_type: Optional[str] = None
    ) -> list[models.Transaction]:
        """
        Get user's transaction history from database (fast queries).
        """
        query = self.db.query(models.Transaction).filter(
            models.Transaction.user_id == user_id
        )
        
        if trade_type:
            query = query.filter(models.Transaction.trade_type == trade_type)
        
        return query.order_by(
            models.Transaction.created_at.desc()
        ).offset(offset).limit(limit).all()
    
    def get_transaction_details_from_blockchain(
        self,
        tx_hash: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed transaction information from blockchain.
        Use this for detailed transaction views or when you need full blockchain data.
        """
        try:
            # Get trade info if it's a trade transaction
            trade_info = get_trade_info(tx_hash)
            if trade_info:
                return {
                    "type": "trade",
                    "blockchain_data": trade_info,
                    "tx_hash": tx_hash
                }
            
            # For other transaction types, you could implement additional blockchain queries
            return {
                "type": "transfer",
                "tx_hash": tx_hash,
                "blockchain_data": None  # Would need to implement transfer history
            }
            
        except Exception as e:
            return None
    
    def sync_blockchain_data(self, tx_hash: str) -> bool:
        """
        Sync blockchain data to database for a specific transaction.
        This can be called periodically or when user requests detailed view.
        """
        try:
            # Get transaction receipt from blockchain
            # This would require implementing web3 receipt fetching
            # For now, we'll just update the status
            
            transaction = self.db.query(models.Transaction).filter(
                models.Transaction.tx_hash == tx_hash
            ).first()
            
            if transaction and transaction.status == models.StatusEnum.pending:
                # In a real implementation, you'd check the blockchain
                # and update with actual block data
                transaction.status = models.StatusEnum.confirmed
                transaction.mined_at = datetime.utcnow()
                self.db.commit()
                return True
                
        except Exception as e:
            return False
        
        return False


def create_transaction_service(db: Session) -> TransactionService:
    """Factory function to create transaction service."""
    return TransactionService(db) 