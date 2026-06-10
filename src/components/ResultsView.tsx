import { useState } from 'react';
import ErrorRow from './ErrorRow';
import styles from './ResultsView.module.css';
import { CsvError, CsvRecord, UploadResult, ResolvedError } from '../types/upload';

interface ResultsViewProps {
  data: UploadResult;
  onNewFile: () => void;
}

export default function ResultsView({ data, onNewFile }: ResultsViewProps) {
  const [errors, setErrors] = useState<CsvError[]>(data.errors);
  const [resolved, setResolved] = useState<ResolvedError[]>([]);

  const handleRetrySuccess = (row: number, newRecord: CsvRecord) => {
    setResolved(r => [...r, { row, record: newRecord }]);
    setErrors(e => e.filter(err => err.row !== row));
  };

  const totalSuccess = data.success.length + resolved.length;
  const totalErrors = errors.length;

  return (
    <div className={styles.wrapper} data-testid="results-view">
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{totalSuccess}</span>
            <span className={styles.statLabel}>exitosos</span>
          </div>
          <div className={styles.statDivider} />
          <div className={`${styles.stat} ${totalErrors > 0 ? styles.statError : ''}`}>
            <span className={styles.statNum}>{totalErrors}</span>
            <span className={styles.statLabel}>errores</span>
          </div>
        </div>
        <button className={styles.newFileBtn} onClick={onNewFile} data-testid="new-file-button">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          New File
        </button>
      </div>

      {/* Success banner */}
      {totalSuccess > 0 && (
        <div className={styles.successBanner} data-testid="success-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <strong>{totalSuccess}</strong> registro{totalSuccess !== 1 ? 's' : ''} cargado{totalSuccess !== 1 ? 's' : ''} exitosamente
        </div>
      )}

      {/* Error section */}
      {totalErrors > 0 ? (
        <div className={styles.errorSection}>
          <p className={styles.errorIntro}>
            Los <strong>({totalErrors})</strong> registros listados a continuación encontraron errores. Por favor, corrígelos y reintenta.
          </p>

          <div className={styles.errorHeader}>
            <span className={styles.colRow}>Fila</span>
            <span className={styles.colName}>Nombre</span>
            <span className={styles.colEmail}>Email</span>
            <span className={styles.colAge}>Edad</span>
            <span className={styles.colAction} />
          </div>

          <div className={styles.errorList}>
            {errors.map(err => (
              <ErrorRow
                key={err.row}
                error={err}
                onRetrySuccess={handleRetrySuccess}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.allClear} data-testid="all-clear">
          <span className={styles.allClearIcon}>✓</span>
          <p>Todos los registros han sido procesados correctamente.</p>
        </div>
      )}
    </div>
  );
}
