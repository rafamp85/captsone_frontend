import { renderHook, act } from '@testing-library/react';
import { useLogin } from '../../../../infrastructure/ui/Login.hook';
import { RequestOtpUseCase } from '../../../../application/RequestOtpUseCase';
import { AuthPort } from '../../../../application/ports/AuthPort';

function stubAuthPort(): AuthPort {
  return {
    requestOtp: async () => {},
    verifyOtp: async () => 'token',
  };
}

describe('The Login State', () => {
  it('initializes in idle state before any interaction', () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());

    const { result } = renderHook(() => useLogin(useCase));

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error.isNone()).toBe(true);
  });

  it('indicates loading while sending OTP request', async () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());
    const { result } = renderHook(() => useLogin(useCase));

    act(() => {
      result.current.requestOtp('user@example.com');
    });

    expect(result.current.loading).toBe(true);
  });

  it('confirms OTP sent successfully', async () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());
    const { result } = renderHook(() => useLogin(useCase));

    await act(async () => {
      await result.current.requestOtp('user@example.com');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(true);
    expect(result.current.email).toBe('user@example.com');
  });

  it('reports error for invalid email format', async () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());
    const { result } = renderHook(() => useLogin(useCase));

    await act(async () => {
      await result.current.requestOtp('invalid-email');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error.isSome()).toBe(true);
    expect(result.current.error.getOrThrow()).toBe('Invalid email format');
  });

  it('captures email input changes', () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());
    const { result } = renderHook(() => useLogin(useCase));

    act(() => {
      result.current.setEmail('new@email.com');
    });

    expect(result.current.email).toBe('new@email.com');
  });
});
