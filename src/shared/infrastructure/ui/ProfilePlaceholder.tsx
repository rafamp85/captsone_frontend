import styles from './ProfilePlaceholder.module.css';

export function ProfilePlaceholder() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Perfil</h1>
        <p className={styles.subtitle}>Próximamente</p>
        <p className={styles.message}>Esta sección estará disponible en la siguiente fase de desarrollo.</p>
      </div>
    </div>
  );
}
