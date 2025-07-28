import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Items from '../pages/Items';
import * as api from '../api';

jest.mock('../api');

const mockItems = [
  {
    id: 1,
    name: 'Test Item 1',
    description: 'Test Description 1',
    price: 100,
    image_url: 'test1.jpg',
    tags: '["S", "M", "L"]'
  },
  {
    id: 2,
    name: 'Test Item 2',
    description: 'Test Description 2',
    price: 200,
    image_url: 'test2.jpg',
    tags: null
  }
];

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Items Component', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ 
      id: 1, 
      username: 'testuser', 
      wallet_address: '0x1234567890123456789012345678901234567890' 
    }));
    api.fetchItems.mockResolvedValue(mockItems);
    api.fetchUserBalance.mockResolvedValue('1000000000000000000');
    jest.clearAllMocks();
  });

  test('renders items list', async () => {
    renderWithRouter(<Items logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('search functionality works', async () => {
    renderWithRouter(<Items logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Find your items');
    fireEvent.change(searchInput, { target: { value: 'Item 1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Item 2')).not.toBeInTheDocument();
    });
  });

  test('sort functionality works', async () => {
    renderWithRouter(<Items logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'price-high' } });
    
    await waitFor(() => {
      const items = screen.getAllByText(/Test Item/);
      expect(items[0]).toHaveTextContent('Test Item 2');
    });
  });

  test('displays wallet balance', async () => {
    renderWithRouter(<Items logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/1\.0 GOLD/)).toBeInTheDocument();
    });
  });

  test('opens item details dialog', async () => {
    renderWithRouter(<Items logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    const viewDetailsButton = screen.getAllByText('View Details')[0];
    fireEvent.click(viewDetailsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    });
  });
});
