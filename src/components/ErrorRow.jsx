import { useState } from 'react';
import { apiRetryRow } from '../services/api';
import styles from './ErrorRow.module.css';

export default function ErrorRow({ error, onRetrySuccess }) {
  const [fields, setFields] = useState({
    name: error.data?.name ?? '',
    email: error.data?.email ?? '',
    age: error.data?.age ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [retried, setRetried] = useState(false);
  const [fieldErrors, setFieldErrors] = useState(error.details || {});

  const validate = () => {
    const errs = {};
    if (!fields.name.trim()) errs.name = "El campo 'name' no puede estar vacío.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = "El formato del campo 'email' es inválido.";
    const ageNum = Number(fields.age);
    if (!fields.age || isNaN(ageNum) || ageNum <= 0 || !Number.isInteger(ageNum)) {
      errs.age = "El campo 'age' debe ser un número positivo.";
    }
    return errs;
  };

  const handleRetry = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await apiRetryRow({ ...fields, age: Number(fields.age) });
      if (res.ok) {
        setRetried(true);
        onRetrySuccess(error.row, res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (retried) return null;

  return (
    <div className={styles.row} data-testid={`error-row-${error.row}`}>
      <div className={styles.rowNum}>
        <span className={styles.rowLabel}>Fila</span>
        <span className={styles.rowValue}>{error.row}</span>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Nombre</label>
          <input
            className={`${styles.input} ${fieldErrors.name ? styles.inputError : ''}`}
            value={fields.name}
            onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
            placeholder="Nombre"
            disabled={loading}
            data-testid={`name-input-${error.row}`}
          />
          {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Email</label>
          <input
            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
            value={fields.email}
            onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
            placeholder="email@ejemplo.com"
            disabled={loading}
            data-testid={`email-input-${error.row}`}
          />
          {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
        </div>

        <div className={`${styles.field} ${styles.fieldSm}`}>
          <label className={styles.fieldLabel}>Edad</label>
          <input
            className={`${styles.input} ${fieldErrors.age ? styles.inputError : ''}`}
            value={fields.age}
            onChange={e => setFields(f => ({ ...f, age: e.target.value }))}
            placeholder="25"
            disabled={loading}
            data-testid={`age-input-${error.row}`}
          />
          {fieldErrors.age && <span className={styles.fieldError}>{fieldErrors.age}</span>}
        </div>
      </div>

      <button
        className={styles.retryBtn}
        onClick={handleRetry}
        disabled={loading}
        data-testid={`retry-btn-${error.row}`}
      >
        {loading ? <span className={styles.spinner} /> : 'Retry'}
      </button>
    </div>
  );
}
