import { RequestOtpUseCase } from '../../../application/RequestOtpUseCase';
import { AuthPort } from '../../../application/ports/AuthPort';

function stubAuthPort(): AuthPort {
  return {
    requestOtp: async () => {},
    verifyOtp: async () => 'token',
  };
}

describe('The OTP Request', () => {
  it('sends code to valid email addresses', async () => {
    const authPort = stubAuthPort();
    const useCase = new RequestOtpUseCase(authPort);

    const result = await useCase.execute('user@example.com');

    expect(result.success).toBe(true);
    expect(result.message).toBe('OTP sent');
  });

  it('rejects invalid email formats', async () => {
    const authPort = stubAuthPort();
    const useCase = new RequestOtpUseCase(authPort);

    const result = await useCase.execute('invalid-email');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email format');
  });
});
