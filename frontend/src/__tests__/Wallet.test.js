import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Wallet from '../pages/Wallet';
import * as api from '../api';

jest.mock('../api');

const mockTransactions = [
  {
    id: 1,
    amount: 100,
    direction: 'debit',
    description: 'Item purchase',
    created_at: '2025-01-01T10:00:00Z',
    tx_hash: '0xtest123',
    status: 'confirmed'
  },
  {
    id: 2,
    amount: 50,
    direction: 'credit',
    description: 'Event reward',
    created_at: '2025-01-02T10:00:00Z',
    tx_hash: '0xtest456',
    status: 'pending'
  }
];

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Wallet Component', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ 
      id: 1, 
      username: 'testuser', 
      wallet_address: '0x1234567890123456789012345678901234567890' 
    }));
    api.fetchUserBalance.mockResolvedValue('1000000000000000000');
    api.fetchTransactions.mockResolvedValue(mockTransactions);
    api.requestWalletChallenge.mockResolvedValue({ challenge: 'test challenge' });
    api.verifyWalletSignature.mockResolvedValue({ verified: true });
    api.updateWalletAddress.mockResolvedValue({ 
      id: 1, 
      username: 'testuser', 
      wallet_address: '0x1234567890123456789012345678901234567890' 
    });
    jest.clearAllMocks();
  });

  test('displays wallet balance', async () => {
    renderWithRouter(<Wallet logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/1\.0 GOLD/)).toBeInTheDocument();
    });
  });

  test('displays connected wallet address', async () => {
    renderWithRouter(<Wallet logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Connected: 0x1234\.\.\.7890/)).toBeInTheDocument();
    });
  });

  test('shows transaction history', async () => {
    renderWithRouter(<Wallet logout={() => {}} />);
    
    const historyButton = screen.getByText('View history');
    fireEvent.click(historyButton);
    
    await waitFor(() => {
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
      expect(screen.getByText('Item purchase')).toBeInTheDocument();
      expect(screen.getByText('Event reward')).toBeInTheDocument();
    });
  });

  test('switches between wallet views', async () => {
    renderWithRouter(<Wallet logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('My Wallet')).toBeInTheDocument();
    });
    
    const statisticsButton = screen.getByText('Statistics');
    fireEvent.click(statisticsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  test('displays transaction status chips', async () => {
    renderWithRouter(<Wallet logout={() => {}} />);
    
    const historyButton = screen.getByText('View history');
    fireEvent.click(historyButton);
    
    await waitFor(() => {
      expect(screen.getByText('confirmed')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });
});
