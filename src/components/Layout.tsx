import {ReactNode} from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⬡</span>
          <span className={styles.brandName}>Sistema de Carga de Datos</span>
        </div>
        {user && (
          <div className={styles.userArea}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userBadge}>{user.role}</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Salir
            </button>
          </div>
        )}
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
