import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import * as api from '../api';

jest.mock('../api');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('redirects to /events when authenticated', () => {
    const mockUser = { id: 1, username: 'testuser', is_admin: false };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    renderWithRouter(<App />);
    expect(window.location.pathname).toBe('/');
  });

  test('shows login page when not authenticated', () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test('successful login updates authentication state', async () => {
    const mockUser = { id: 1, username: 'testuser', is_admin: false };
    api.loginUser.mockResolvedValue(mockUser);
    
    renderWithRouter(<App />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith('testuser', 'password');
    });
  });

  test('logout clears user state and localStorage', () => {
    const mockUser = { id: 1, username: 'testuser', is_admin: false };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    renderWithRouter(<App />);
    
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);
    
    expect(localStorage.getItem('user')).toBeNull();
  });
});
