import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResultsView from '../components/ResultsView';
import * as api from '../services/api';
import { UploadResult } from '../types/upload';

const mockData: UploadResult = {
  success: [
    { name: 'Juan Pérez', email: 'juan@test.com', age: 28 },
    { name: 'Ana García', email: 'ana@test.com', age: 34 },
  ],
  errors: [
    {
      row: 4,
      data: { name: 'Testino', email: 'bad-email', age: '25' },
      details: { email: "El formato del campo 'email' es inválido." },
    },
  ],
};

describe('ResultsView', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('shows success count in banner', () => {
    render(<ResultsView data={mockData} onNewFile={vi.fn()} />);
    expect(screen.getByTestId('success-banner')).toHaveTextContent('2');
  });

  it('renders error rows', () => {
    render(<ResultsView data={mockData} onNewFile={vi.fn()} />);
    expect(screen.getByTestId('error-row-4')).toBeInTheDocument();
  });

  it('calls onNewFile when "New File" button is clicked', () => {
    const onNewFile = vi.fn();
    render(<ResultsView data={mockData} onNewFile={onNewFile} />);
    fireEvent.click(screen.getByTestId('new-file-button'));
    expect(onNewFile).toHaveBeenCalledTimes(1);
  });

  it('removes error row from list after successful retry', async () => {
    vi.spyOn(api, 'apiRetryRow').mockResolvedValue({
      ok: true,
      data: { name: 'Testino', email: 'testino@valid.com', age: 25 },
    });

    render(<ResultsView data={mockData} onNewFile={vi.fn()} />);
    // Fix the invalid email first so validation passes
    fireEvent.change(screen.getByTestId('email-input-4'), { target: { value: 'testino@valid.com' } });
    fireEvent.click(screen.getByTestId('retry-btn-4'));

    await waitFor(() => {
      expect(screen.queryByTestId('error-row-4')).not.toBeInTheDocument();
    });
  });

  it('shows "all clear" message when all errors are resolved', async () => {
    vi.spyOn(api, 'apiRetryRow').mockResolvedValue({
      ok: true,
      data: { name: 'Fixed', email: 'fixed@mail.com', age: 25 },
    });

    render(<ResultsView data={mockData} onNewFile={vi.fn()} />);
    fireEvent.change(screen.getByTestId('email-input-4'), { target: { value: 'fixed@mail.com' } });
    fireEvent.click(screen.getByTestId('retry-btn-4'));

    await waitFor(() => {
      expect(screen.getByTestId('all-clear')).toBeInTheDocument();
    });
  });

  it('shows validation error when retrying with empty name', async () => {
    render(<ResultsView data={mockData} onNewFile={vi.fn()} />);
    const nameInput = screen.getByTestId('name-input-4');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByTestId('retry-btn-4'));

    await waitFor(() => {
      expect(screen.getByText(/no puede estar vacío/i)).toBeInTheDocument();
    });
  });
});
