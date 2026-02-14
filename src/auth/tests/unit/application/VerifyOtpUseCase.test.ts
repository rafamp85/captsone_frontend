import { VerifyOtpUseCase } from '../../../application/VerifyOtpUseCase';
import { AuthPort } from '../../../application/ports/AuthPort';
import { TokenPort } from '../../../../shared/application/ports/TokenPort';
import { DomainError } from '../../../../shared/domain/DomainError';
import { Maybe } from '../../../../shared/domain/Maybe';

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

function stubTokenPort(): TokenPort & { savedToken: Maybe<string> } {
  const stub = {
    savedToken: Maybe.none<string>(),
    saveToken(token: string) {
      stub.savedToken = Maybe.some(token);
    },
    getToken() {
      return stub.savedToken;
    },
    clearToken() {
      stub.savedToken = Maybe.none();
    },
  };
  return stub;
}

describe('The OTP Verification', () => {
  it('authenticates user with valid OTP code', async () => {
    const authPort = stubAuthPort('jwt-token');
    const tokenPort = stubTokenPort();
    const useCase = new VerifyOtpUseCase(authPort, tokenPort);

    const result = await useCase.execute('user@example.com', '123456');

    expect(result.success).toBe(true);
    expect(result.token).toBe('jwt-token');
    expect(tokenPort.savedToken.getOrThrow()).toBe('jwt-token');
  });

  it('rejects invalid email formats', async () => {
    const authPort = stubAuthPort('jwt-token');
    const tokenPort = stubTokenPort();
    const useCase = new VerifyOtpUseCase(authPort, tokenPort);

    const result = await useCase.execute('invalid-email', '123456');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email format');
    expect(tokenPort.savedToken.isNone()).toBe(true);
  });

  it('rejects malformed OTP codes', async () => {
    const authPort = stubAuthPort('jwt-token');
    const tokenPort = stubTokenPort();
    const useCase = new VerifyOtpUseCase(authPort, tokenPort);

    const result = await useCase.execute('user@example.com', '12345');

    expect(result.success).toBe(false);
    expect(result.message).toBe('OTP must be exactly 6 digits');
    expect(tokenPort.savedToken.isNone()).toBe(true);
  });

  it('rejects incorrect OTP codes', async () => {
    const authPort = stubAuthPortWithInvalidOtp();
    const tokenPort = stubTokenPort();
    const useCase = new VerifyOtpUseCase(authPort, tokenPort);

    const result = await useCase.execute('user@example.com', '654321');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid OTP');
    expect(tokenPort.savedToken.isNone()).toBe(true);
  });
});
