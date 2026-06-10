import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';

const renderDashboard = () => {
  localStorage.setItem(
    'auth_user',
    JSON.stringify({ email: 'admin@mail.com', name: 'Mr. Admin', role: 'admin' })
  );
  return render(
    <MemoryRouter>
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders upload form initially', () => {
    renderDashboard();
    expect(screen.getByTestId('upload-form')).toBeInTheDocument();
  });

  it('shows results view after successful upload', async () => {
    vi.spyOn(api, 'apiUpload').mockResolvedValue({
      ok: true as const,
      data: {
        success: [{ name: 'Juan', email: 'juan@test.com', age: 28 }],
        errors: [],
      },
    });

    renderDashboard();
    const file = new File(['name,email,age\nJuan,juan@test.com,28'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    fireEvent.click(screen.getByTestId('upload-button'));

    await waitFor(() => {
      expect(screen.getByTestId('results-view')).toBeInTheDocument();
    });
  });

  it('shows error banner on failed upload', async () => {
    vi.spyOn(api, 'apiUpload').mockResolvedValue({ ok: false as const, error: 'Formato inválido' });

    renderDashboard();
    const file = new File(['name,email,age'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    fireEvent.click(screen.getByTestId('upload-button'));

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument();
    });
  });

  it('returns to upload form when "New File" is clicked', async () => {
    vi.spyOn(api, 'apiUpload').mockResolvedValue({
      ok: true as const,
      data: { success: [{ name: 'Juan', email: 'j@j.com', age: 20 }], errors: [] },
    });

    renderDashboard();
    const file = new File(['name,email,age'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    fireEvent.click(screen.getByTestId('upload-button'));

    await waitFor(() => expect(screen.getByTestId('results-view')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('new-file-button'));

    expect(screen.getByTestId('upload-form')).toBeInTheDocument();
    expect(screen.queryByTestId('results-view')).not.toBeInTheDocument();
  });
});
