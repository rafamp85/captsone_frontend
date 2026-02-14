import { HttpAuthAdapter } from '../../infrastructure/adapters/HttpAuthAdapter';
import { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { Email } from '../../domain/value-objects/Email';
import { OtpCode } from '../../domain/value-objects/OtpCode';

/**
 * Integration tests for HttpAuthAdapter.
 * Require the backend-template running on VITE_API_URL or http://localhost:8080
 *
 * Run: npm run test:integration
 */
describe('The Auth API Client', () => {
  const baseUrl = process.env.VITE_API_URL || 'http://localhost:8080';
  const httpClient = new HttpClient(baseUrl);
  const adapter = new HttpAuthAdapter(httpClient);

  it('requests OTP successfully for a registered user', async () => {
    const email = Email.create('test@example.com');

    await expect(adapter.requestOtp(email)).resolves.toBeUndefined();
  });

  it('rejects OTP request for non-existent user', async () => {
    const email = Email.create('nonexistent@example.com');

    await expect(adapter.requestOtp(email)).rejects.toThrow();
  });

  // Requires backend to expose generated OTP (e.g. in response body or via debug endpoint)
  it.skip('verifies OTP and authenticates with valid credentials', async () => {
    const email = Email.create('test@example.com');
    await adapter.requestOtp(email);
    const otp = OtpCode.create('000000'); // TODO: replace with real OTP from backend

    const token = await adapter.verifyOtp(email, otp);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('rejects invalid OTP codes', async () => {
    const email = Email.create('test@example.com');
    const invalidOtp = OtpCode.create('000000');

    await expect(adapter.verifyOtp(email, invalidOtp)).rejects.toThrow();
  });

  it('fails when backend is unreachable', async () => {
    const badClient = new HttpClient('http://localhost:9999');
    const badAdapter = new HttpAuthAdapter(badClient);
    const email = Email.create('test@example.com');

    await expect(badAdapter.requestOtp(email)).rejects.toThrow();
  });
});
