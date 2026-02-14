import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLogin } from './Login.hook';
import { RequestOtpUseCase } from '../../application/RequestOtpUseCase';
import { TokenPort } from '../../../shared/application/ports/TokenPort';
import { Factory } from '../../../shared/infrastructure/factory';
import { Routes } from '../../../shared/infrastructure/ui/routes';
import styles from './Login.module.css';

export function LoginContainer() {
  const useCase = Factory.createRequestOtpUseCase();
  const tokenPort = Factory.getTokenPort();
  return <Login useCase={useCase} tokenPort={tokenPort} />;
}

interface Props {
  useCase: RequestOtpUseCase;
  tokenPort: TokenPort;
}

export function Login(props: Props) {
  const hook = useLogin(props.useCase);
  const navigate = useNavigate();
  const hasToken = props.tokenPort.getToken().isSome();

  useEffect(() => {
    if (hook.success) {
      navigate(`${Routes.Verify}?email=${encodeURIComponent(hook.email)}`);
    }
  }, [hook.success, hook.email, navigate]);

  if (hasToken) {
    return <Navigate to={Routes.Profile} replace />;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    hook.requestOtp(hook.email);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Introduce tu email para recibir un código de acceso</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Email"
            value={hook.email}
            onChange={(e) => hook.setEmail(e.target.value)}
            className={styles.input}
            disabled={hook.loading}
            autoComplete="email"
          />
          <button type="submit" className={styles.button} disabled={hook.loading || !hook.email}>
            {hook.loading ? 'Enviando...' : 'Enviar código'}
          </button>
        </form>
        {hook.error.isSome() && <div className={styles.error}>{hook.error.getOrThrow()}</div>}
      </div>
    </div>
  );
}
