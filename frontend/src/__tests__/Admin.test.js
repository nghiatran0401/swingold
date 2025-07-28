import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Admin from '../pages/Admin';
import * as api from '../api';

jest.mock('../api');

const mockEvents = [
  {
    id: 1,
    name: 'Test Event',
    category: 'Tech',
    price: 0,
    status: 'upcoming'
  }
];

const mockItems = [
  {
    id: 1,
    name: 'Test Item',
    description: 'Test Description',
    price: 100
  }
];

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Admin Component', () => {
  const adminUser = { id: 1, username: 'admin', is_admin: true };
  const regularUser = { id: 2, username: 'user', is_admin: false };

  beforeEach(() => {
    api.fetchEvents.mockResolvedValue(mockEvents);
    api.fetchItems.mockResolvedValue(mockItems);
    api.createEvent.mockResolvedValue({ id: 2, name: 'New Event' });
    api.createItem.mockResolvedValue({ id: 2, name: 'New Item' });
    api.updateEvent.mockResolvedValue({ id: 1, name: 'Updated Event' });
    api.updateItem.mockResolvedValue({ id: 1, name: 'Updated Item' });
    api.deleteEvent.mockResolvedValue({ success: true });
    api.deleteItem.mockResolvedValue({ success: true });
    jest.clearAllMocks();
  });

  test('denies access to non-admin users', () => {
    renderWithRouter(<Admin user={regularUser} />);
    expect(screen.getByText('Access denied. Admins only.')).toBeInTheDocument();
  });

  test('allows access to admin users', async () => {
    renderWithRouter(<Admin user={adminUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Items')).toBeInTheDocument();
    });
  });

  test('displays events list', async () => {
    renderWithRouter(<Admin user={adminUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
  });

  test('switches to items tab', async () => {
    renderWithRouter(<Admin user={adminUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Events')).toBeInTheDocument();
    });
    
    const itemsTab = screen.getByText('Items');
    fireEvent.click(itemsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  test('opens create event dialog', async () => {
    renderWithRouter(<Admin user={adminUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Event')).toBeInTheDocument();
    });
    
    const createButton = screen.getByText('Create New Event');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Event')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });
  });

  test('opens create item dialog', async () => {
    renderWithRouter(<Admin user={adminUser} />);
    
    const itemsTab = screen.getByText('Items');
    fireEvent.click(itemsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Item')).toBeInTheDocument();
    });
    
    const createButton = screen.getByText('Create New Item');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Item')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });
  });

  test('deletes event', async () => {
    renderWithRouter(<Admin user={adminUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getAllByTestId('DeleteIcon')[0];
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(api.deleteEvent).toHaveBeenCalledWith(1, 1);
    });
  });
});
