import { DomainError } from '../../../shared/domain/DomainError';

export class UserName {
  private constructor(readonly value: string) {}

  static create(value: string): UserName {
    const trimmed = value.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      throw DomainError.createValidation('Name must be between 2 and 100 characters');
    }
    return new UserName(trimmed);
  }
}
