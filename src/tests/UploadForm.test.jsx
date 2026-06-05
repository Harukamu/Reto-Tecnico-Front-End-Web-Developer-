import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadForm from '../components/UploadForm';

describe('UploadForm', () => {
  it('renders drop zone and upload button', () => {
    render(<UploadForm onUpload={vi.fn()} loading={false} />);
    expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
  });

  it('upload button is disabled when no file is selected', () => {
    render(<UploadForm onUpload={vi.fn()} loading={false} />);
    expect(screen.getByTestId('upload-button')).toBeDisabled();
  });

  it('upload button is enabled after selecting a CSV file', () => {
    render(<UploadForm onUpload={vi.fn()} loading={false} />);
    const file = new File(['name,email,age\nJuan,juan@test.com,25'], 'data.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByTestId('upload-button')).not.toBeDisabled();
  });

  it('calls onUpload with the selected file when submitted', () => {
    const onUpload = vi.fn();
    render(<UploadForm onUpload={onUpload} loading={false} />);
    const file = new File(['name,email,age'], 'data.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByTestId('upload-button'));
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('shows loading state when loading prop is true', () => {
    render(<UploadForm onUpload={vi.fn()} loading={true} />);
    expect(screen.getByTestId('upload-button')).toBeDisabled();
    expect(screen.getByTestId('upload-button')).toHaveTextContent('Procesando...');
  });
});
