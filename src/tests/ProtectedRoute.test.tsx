import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider, } from '../context/AuthContext';
import { apiLogin, apiRetryRow } from '../services/api';
import {User} from '../types/auth';
// --- ProtectedRoute ---
const makeAuthState = (user: User | null) => {
  // Preset localStorage before render so AuthProvider picks it up
  if (user) localStorage.setItem('auth_user', JSON.stringify(user));
  else localStorage.removeItem('auth_user');
};

const renderProtected = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requiredRole="admin">
                <div data-testid="protected-content">Protected!</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => localStorage.clear());

  it('redirects to /login when user is not authenticated', () => {
    renderProtected();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders protected content for admin user', () => {
    makeAuthState({ email: 'admin@mail.com', name: 'Mr. Admin', role: 'admin' });
    renderProtected();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects non-admin user to /login', () => {
    makeAuthState({ email: 'user@mail.com', name: 'Regular User', role: 'user' });
    renderProtected();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});

// --- API service ---
describe('apiLogin', () => {
  it('returns ok: true for valid credentials', async () => {
    const res = await apiLogin('admin@mail.com', 'supersecret');
    expect(res.ok).toBe(true);
    if (!res.ok) throw new Error('Expected login to succeed');
    expect(res.data.role).toBe('admin');
    expect(res.data.email).toBe('admin@mail.com');
  });

  it('returns ok: false for invalid credentials', async () => {
    const res = await apiLogin('wrong@mail.com', 'badpass');
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error('Expected login to fail');
    expect(res.error).toBeTruthy();
  });

  it('returns "Credenciales inválidas" error message', async () => {
    const res = await apiLogin('bad@mail.com', 'nope');
    if (res.ok) throw new Error('Expected login to fail');
    expect(res.error).toMatch(/credenciales inv/i);
  });
});

describe('apiRetryRow', () => {
  it('returns ok: true with submitted data', async () => {
    const row = { name: 'Test', email: 'test@test.com', age: 25 };
    const res = await apiRetryRow(row);
    expect(res.ok).toBe(true);
    expect(res.data.name).toBe('Test');
    expect(res.data.email).toBe('test@test.com');
  });
});
