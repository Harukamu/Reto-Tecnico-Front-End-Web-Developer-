import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiLogin } from '../services/api';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiLogin(email, password);
      if (res.ok) {
        login(res.data);
        navigate('/', { replace: true });
      } else {
        setError(res.error);
      }
    } catch {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} data-testid="login-card">
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
        </div>
        <h1 className={styles.title}>Sistema de Carga<br />de Datos</h1>
        <p className={styles.subtitle}>Acceso restringido a administradores</p>

        <form className={styles.form} onSubmit={handleSubmit} data-testid="login-form">
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              data-testid="email-input"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="admin@mail.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <input
              id="password"
              data-testid="password-input"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.errorBanner} data-testid="error-message" role="alert">
              <span className={styles.errorIcon}>!</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            data-testid="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <p className={styles.hint}>
          Usa <code>admin@mail.com</code> / <code>supersecret</code>
        </p>
      </div>
    </div>
  );
}
