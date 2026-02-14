import { DomainError } from '../../../shared/domain/DomainError';

export class OtpCode {
  private constructor(readonly value: string) {}

  static create(value: string): OtpCode {
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(value)) {
      throw DomainError.createValidation('OTP must be exactly 6 digits');
    }
    return new OtpCode(value);
  }

  equals(other: OtpCode): boolean {
    return this.value === other.value;
  }
}
