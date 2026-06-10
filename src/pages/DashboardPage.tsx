import { useState } from 'react';
import { apiUpload } from '../services/api';
import UploadForm from '../components/UploadForm';
import ResultsView from '../components/ResultsView';
import styles from './DashboardPage.module.css';
import { UploadResult } from '../types/upload';

type UploadState = 'idle' | 'uploading' | 'results' | 'error';
const STORAGE_KEY = 'upload_results';

export default function DashboardPage() {
  const [state, setState] = useState<UploadState>(() => {
    return sessionStorage.getItem(STORAGE_KEY) ? 'results' : 'idle';
  });
  const [results, setResults] = useState<UploadResult | null>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [uploadError, setUploadError] = useState<string>('');

  const handleUpload = async (file: File) => {
    setState('uploading');
    setUploadError('');
    try {
      const res = await apiUpload(file);
      if (res.ok) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        setResults(res.data);
        setState('results');
      } else {
      setUploadError(res.error);  
      setState('error');
    }
    } catch {
      setUploadError('Error de conexión. Por favor intente de nuevo.');
      setState('error');
    }
  };

  const handleNewFile = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setState('idle');
    setResults(null);
    setUploadError('');
  };

  return (
    <div className={styles.page}>
      {state !== 'results' && (
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Carga de Archivos</h2>
          <p className={styles.pageDesc}>
            Sube un archivo <code>.csv</code> para importar registros al sistema.
          </p>
        </div>
      )}

      {(state === 'idle' || state === 'uploading' || state === 'error') && (
        <div className={styles.card} data-testid="upload-card">
          <UploadForm onUpload={handleUpload} loading={state === 'uploading'} />
          {state === 'error' && (
            <div className={styles.errorBanner} role="alert" data-testid="upload-error">
              <span>⚠</span> {uploadError}
            </div>
          )}
        </div>
      )}

      {state === 'results' && results && (
        <ResultsView data={results} onNewFile={handleNewFile} />
      )}
    </div>
  );
}
