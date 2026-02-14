import { useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useVerifyOtp } from './VerifyOtp.hook';
import { VerifyOtpUseCase } from '../../application/VerifyOtpUseCase';
import { TokenPort } from '../../../shared/application/ports/TokenPort';
import { Factory } from '../../../shared/infrastructure/factory';
import { Routes } from '../../../shared/infrastructure/ui/routes';
import styles from './VerifyOtp.module.css';

export function VerifyOtpContainer() {
  const useCase = Factory.createVerifyOtpUseCase();
  const tokenPort = Factory.getTokenPort();
  return <VerifyOtp useCase={useCase} tokenPort={tokenPort} />;
}

interface Props {
  useCase: VerifyOtpUseCase;
  tokenPort: TokenPort;
}

export function VerifyOtp(props: Props) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const hook = useVerifyOtp(props.useCase);
  const navigate = useNavigate();
  const hasToken = props.tokenPort.getToken().isSome();

  useEffect(() => {
    if (hook.success) {
      navigate(Routes.Profile);
    }
  }, [hook.success, navigate]);

  if (!email && !hasToken) {
    return <Navigate to={Routes.Login} replace />;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    hook.verifyOtp(email, hook.otp);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Verificar código</h1>
        <p className={styles.subtitle}>
          Hemos enviado un código de 6 dígitos a <span className={styles.email}>{email}</span>
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="000000"
            value={hook.otp}
            onChange={(e) => hook.setOtp(e.target.value)}
            className={styles.input}
            disabled={hook.loading}
            maxLength={6}
            autoComplete="one-time-code"
          />
          <button type="submit" disabled={hook.loading || hook.otp.length !== 6}>
            {hook.loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
        {hook.error.isSome() && <div className={styles.error}>{hook.error.getOrThrow()}</div>}
      </div>
    </div>
  );
}
