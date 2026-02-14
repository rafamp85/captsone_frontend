import { renderHook, act } from '@testing-library/react';
import { useVerifyOtp } from '../../../../infrastructure/ui/VerifyOtp.hook';
import { VerifyOtpUseCase } from '../../../../application/VerifyOtpUseCase';
import { AuthPort } from '../../../../application/ports/AuthPort';
import { TokenPort } from '../../../../../shared/application/ports/TokenPort';
import { DomainError } from '../../../../../shared/domain/DomainError';
import { Maybe } from '../../../../../shared/domain/Maybe';

function stubAuthPort(token: string): AuthPort {
  return {
    requestOtp: async () => {},
    verifyOtp: async () => token,
  };
}

function stubAuthPortWithInvalidOtp(): AuthPort {
  return {
    requestOtp: async () => {},
    verifyOtp: async () => {
      throw DomainError.createValidation('Invalid OTP');
    },
  };
}

function stubTokenPort(): TokenPort {
  return {
    saveToken: () => {},
    getToken: () => Maybe.none(),
    clearToken: () => {},
  };
}

describe('The Verification State', () => {
  it('initializes in idle state before any interaction', () => {
    const useCase = new VerifyOtpUseCase(stubAuthPort('jwt-token'), stubTokenPort());

    const { result } = renderHook(() => useVerifyOtp(useCase));

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error.isNone()).toBe(true);
  });

  it('confirms authentication with valid OTP', async () => {
    const useCase = new VerifyOtpUseCase(stubAuthPort('jwt-token'), stubTokenPort());
    const { result } = renderHook(() => useVerifyOtp(useCase));

    await act(async () => {
      await result.current.verifyOtp('user@example.com', '123456');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(true);
  });

  it('reports error for malformed OTP codes', async () => {
    const useCase = new VerifyOtpUseCase(stubAuthPort('jwt-token'), stubTokenPort());
    const { result } = renderHook(() => useVerifyOtp(useCase));

    await act(async () => {
      await result.current.verifyOtp('user@example.com', '12345');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error.isSome()).toBe(true);
    expect(result.current.error.getOrThrow()).toBe('OTP must be exactly 6 digits');
  });

  it('reports error for incorrect OTP codes', async () => {
    const useCase = new VerifyOtpUseCase(stubAuthPortWithInvalidOtp(), stubTokenPort());
    const { result } = renderHook(() => useVerifyOtp(useCase));

    await act(async () => {
      await result.current.verifyOtp('user@example.com', '654321');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error.isSome()).toBe(true);
    expect(result.current.error.getOrThrow()).toBe('Invalid OTP');
  });

  it('captures OTP input changes', () => {
    const useCase = new VerifyOtpUseCase(stubAuthPort('jwt-token'), stubTokenPort());
    const { result } = renderHook(() => useVerifyOtp(useCase));

    act(() => {
      result.current.setOtp('654321');
    });

    expect(result.current.otp).toBe('654321');
  });
});
