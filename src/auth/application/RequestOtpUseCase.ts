import { AuthPort } from './ports/AuthPort';
import { RequestOtpResultDTO } from './AuthDTO';
import { Email } from '../domain/value-objects/Email';

export class RequestOtpUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(emailValue: string): Promise<RequestOtpResultDTO> {
    try {
      const email = Email.create(emailValue);
      await this.authPort.requestOtp(email);
      return { success: true, message: 'OTP sent' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }
}
