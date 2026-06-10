import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';

// Wrap component with required providers
const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email and password fields and login button', () => {
    renderLogin();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('shows error message with invalid credentials', async () => {
    vi.spyOn(api, 'apiLogin').mockResolvedValue({
      ok: false as const,
      error: 'Credenciales inválidas',
    });

    renderLogin();
    await userEvent.type(screen.getByTestId('email-input'), 'wrong@mail.com');
    await userEvent.type(screen.getByTestId('password-input'), 'wrongpass');
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Credenciales inválidas');
    });
  });

  it('does not show error message initially', () => {
    renderLogin();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('calls apiLogin with entered credentials', async () => {
    const spy = vi.spyOn(api, 'apiLogin').mockResolvedValue({
      ok: false as const,
      error: 'Credenciales inválidas',
    });

    renderLogin();
    await userEvent.type(screen.getByTestId('email-input'), 'test@mail.com');
    await userEvent.type(screen.getByTestId('password-input'), 'mypassword');
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith('test@mail.com', 'mypassword');
    });
  });

  it('disables the login button while loading', async () => {
    vi.spyOn(api, 'apiLogin').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: false as const, error: 'err' }), 500))
    );

    renderLogin();
    await userEvent.type(screen.getByTestId('email-input'), 'a@b.com');
    await userEvent.type(screen.getByTestId('password-input'), 'pass');
    fireEvent.click(screen.getByTestId('login-button'));

    expect(screen.getByTestId('login-button')).toBeDisabled();
    await waitFor(() => expect(screen.getByTestId('login-button')).not.toBeDisabled());
  });
});
