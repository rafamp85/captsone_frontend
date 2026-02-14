import { AuthPort } from './ports/AuthPort';
import { TokenPort } from '../../shared/application/ports/TokenPort';
import { VerifyOtpResultDTO } from './AuthDTO';
import { Email } from '../domain/value-objects/Email';
import { OtpCode } from '../domain/value-objects/OtpCode';

export class VerifyOtpUseCase {
  constructor(
    private readonly authPort: AuthPort,
    private readonly tokenPort: TokenPort
  ) {}

  async execute(emailValue: string, otpValue: string): Promise<VerifyOtpResultDTO> {
    try {
      const email = Email.create(emailValue);
      const otp = OtpCode.create(otpValue);
      const token = await this.authPort.verifyOtp(email, otp);
      this.tokenPort.saveToken(token);
      return { success: true, token };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }
}
