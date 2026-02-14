import { useState } from 'react';
import { Maybe } from '../../../shared/domain/Maybe';
import { VerifyOtpUseCase } from '../../application/VerifyOtpUseCase';

interface VerifyOtpState {
  otp: string;
  loading: boolean;
  success: boolean;
  error: Maybe<string>;
}

const initialState: VerifyOtpState = {
  otp: '',
  loading: false,
  success: false,
  error: Maybe.none(),
};

export function useVerifyOtp(useCase: VerifyOtpUseCase) {
  const [state, setState] = useState<VerifyOtpState>(initialState);

  const setOtp = (otp: string) => {
    setState((prev) => ({ ...prev, otp }));
  };

  const startLoading = () => {
    setState((prev) => ({ ...prev, loading: true, error: Maybe.none() }));
  };

  const setSuccess = () => {
    setState((prev) => ({ ...prev, loading: false, success: true }));
  };

  const setError = (message: string) => {
    setState((prev) => ({ ...prev, loading: false, error: Maybe.some(message) }));
  };

  const verifyOtp = async (email: string, otp: string) => {
    startLoading();
    const result = await useCase.execute(email, otp);
    if (result.success) {
      setSuccess();
    } else {
      setError(result.message || 'Unknown error');
    }
  };

  return {
    otp: state.otp,
    loading: state.loading,
    success: state.success,
    error: state.error,
    setOtp,
    verifyOtp,
  };
}
