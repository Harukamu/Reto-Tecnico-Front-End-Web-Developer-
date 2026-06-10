import { useState, useRef } from 'react';
import styles from './UploadForm.module.css';

interface UploadFormProps {
  onUpload: (file: File) => void;
  loading: boolean;
}
export default function UploadForm({ onUpload, loading }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null | undefined) => {
    if (f && f.name.endsWith('.csv')) {
      setFile(f);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file) onUpload(file);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.wrapper} data-testid="upload-form">
      <div
        className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${file ? styles.hasFile : ''}`}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Zona de carga de archivos CSV"
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && inputRef.current?.click()}
        data-testid="drop-zone"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className={styles.hidden}
          onChange={e => handleFile(e.target.files?.[0])}
          data-testid="file-input"
          disabled={loading}
        />

        {file ? (
          <div className={styles.fileInfo}>
            <span className={styles.fileIcon}>📄</span>
            <div>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={e => { e.stopPropagation(); setFile(null); }}
              aria-label="Quitar archivo"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.uploadIcon}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 28V12M20 12L13 19M20 12L27 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 30h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className={styles.dropText}>
              {dragOver ? 'Suelta el archivo aquí' : 'Selecciona un archivo de carga'}
            </p>
            <p className={styles.dropHint}>Arrastra y suelta o haz clic · Solo archivos <code>.csv</code></p>
          </div>
        )}
      </div>

      <button
        type="submit"
        className={styles.uploadBtn}
        disabled={!file || loading}
        data-testid="upload-button"
      >
        {loading ? (
          <>
            <span className={styles.spinner} />
            Procesando...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 11V3M8 3L4 7M8 3L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Upload File
          </>
        )}
      </button>
    </form>
  );
}
