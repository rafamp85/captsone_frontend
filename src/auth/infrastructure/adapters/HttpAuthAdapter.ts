import { AuthPort } from '../../application/ports/AuthPort';
import { Email } from '../../domain/value-objects/Email';
import { OtpCode } from '../../domain/value-objects/OtpCode';
import { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { Endpoints } from '../../../shared/infrastructure/http/endpoints';

interface RequestOtpResponse {
  message: string;
}

interface VerifyOtpResponse {
  token: string;
}

export class HttpAuthAdapter implements AuthPort {
  constructor(private readonly httpClient: HttpClient) {}

  async requestOtp(email: Email): Promise<void> {
    await this.httpClient.post<RequestOtpResponse>(Endpoints.RequestOtp, {
      email: email.value,
    });
  }

  async verifyOtp(email: Email, otp: OtpCode): Promise<string> {
    const response = await this.httpClient.post<VerifyOtpResponse>(Endpoints.VerifyOtp, {
      email: email.value,
      otp: otp.value,
    });
    return response.token;
  }
}
