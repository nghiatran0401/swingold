import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Events from '../pages/Events';
import * as api from '../api';

jest.mock('../api');

const mockEvents = [
  {
    id: 1,
    name: 'Test Event 1',
    description: 'Test Description 1',
    category: 'Tech',
    start_datetime: '2025-12-01T10:00:00',
    end_datetime: '2025-12-01T12:00:00',
    price: 0,
    location: 'Online',
    seats_available: 50,
    status: 'upcoming',
    image_url: 'test1.jpg'
  },
  {
    id: 2,
    name: 'Test Event 2',
    description: 'Test Description 2',
    category: 'Gaming',
    start_datetime: '2025-11-15T14:00:00',
    price: 100,
    location: 'Venue',
    status: 'upcoming',
    image_url: 'test2.jpg'
  }
];

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Events Component', () => {
  beforeEach(() => {
    api.fetchEvents.mockResolvedValue(mockEvents);
    api.fetchAvailableMonths.mockResolvedValue(['2025-11', '2025-12']);
    api.toggleEventEnrollment.mockResolvedValue({ success: true });
    jest.clearAllMocks();
  });

  test('renders events list', async () => {
    renderWithRouter(<Events logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });
  });

  test('month filtering works', async () => {
    renderWithRouter(<Events logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('November')).toBeInTheDocument();
      expect(screen.getByText('December')).toBeInTheDocument();
    });
    
    const novemberChip = screen.getByText('November');
    fireEvent.click(novemberChip);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Event 1')).not.toBeInTheDocument();
    });
  });

  test('search functionality works', async () => {
    renderWithRouter(<Events logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search events');
    fireEvent.change(searchInput, { target: { value: 'Event 1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Event 2')).not.toBeInTheDocument();
    });
  });

  test('enrollment dialog opens and works', async () => {
    renderWithRouter(<Events logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });
    
    const enrollButton = screen.getAllByText('Enroll')[0];
    fireEvent.click(enrollButton);
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Enrollment')).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByText('Yes, Enroll');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(api.toggleEventEnrollment).toHaveBeenCalledWith(1);
    });
  });

  test('displays event details correctly', async () => {
    renderWithRouter(<Events logout={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('📍 Online')).toBeInTheDocument();
      expect(screen.getByText('🏷️ Tech')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });
});
