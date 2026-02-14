import { useState } from 'react';
import { Maybe } from '../../../shared/domain/Maybe';
import { RequestOtpUseCase } from '../../application/RequestOtpUseCase';

interface LoginState {
  email: string;
  loading: boolean;
  success: boolean;
  error: Maybe<string>;
}

const initialState: LoginState = {
  email: '',
  loading: false,
  success: false,
  error: Maybe.none(),
};

export function useLogin(useCase: RequestOtpUseCase) {
  const [state, setState] = useState<LoginState>(initialState);

  const setEmail = (email: string) => {
    setState((prev) => ({ ...prev, email }));
  };

  const startLoading = () => {
    setState((prev) => ({ ...prev, loading: true, error: Maybe.none() }));
  };

  const setError = (message: string) => {
    setState((prev) => ({ ...prev, loading: false, error: Maybe.some(message) }));
  };

  const requestOtp = async (email: string) => {
    startLoading();
    const result = await useCase.execute(email);
    if (result.success) {
      setState((prev) => ({ ...prev, email, loading: false, success: true }));
    } else {
      setError(result.message);
    }
  };

  return {
    email: state.email,
    loading: state.loading,
    success: state.success,
    error: state.error,
    setEmail,
    requestOtp,
  };
}
