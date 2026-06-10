import { useState } from 'react';
import { apiUpload } from '../services/api';
import UploadForm from '../components/UploadForm';
import ResultsView from '../components/ResultsView';
import styles from './DashboardPage.module.css';
import { UploadResult } from '../types/upload';

type UploadState = 'idle' | 'uploading' | 'results' | 'error';

export default function DashboardPage() {
  const [state, setState] = useState<UploadState>('idle');
  const [results, setResults] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const handleUpload = async (file: File) => {
    setState('uploading');
    setUploadError('');
    try {
      const res = await apiUpload(file);
      if (res.ok) {
        setResults(res.data);
        setState('results');
      } else {
      setUploadError(res.error);  // ← ¿tienes esto?
      setState('error');
    }
    } catch {
      setUploadError('Error de conexión. Por favor intente de nuevo.');
      setState('error');
    }
  };

  const handleNewFile = () => {
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
