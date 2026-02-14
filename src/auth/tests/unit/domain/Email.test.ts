import { Email } from '../../../domain/value-objects/Email';

describe('The Email', () => {
  it('preserves the value of a valid email', () => {
    const email = Email.create('user@example.com');

    expect(email.value).toBe('user@example.com');
  });

  it('rejects email without @ symbol', () => {
    expect(() => Email.create('userexample.com')).toThrow('Invalid email format');
  });

  it('rejects email without domain after @', () => {
    expect(() => Email.create('user@')).toThrow('Invalid email format');
  });

  it('rejects email without user before @', () => {
    expect(() => Email.create('@example.com')).toThrow('Invalid email format');
  });

  it('rejects empty email', () => {
    expect(() => Email.create('')).toThrow('Invalid email format');
  });

  it('considers two emails with the same value as equal', () => {
    const email1 = Email.create('user@example.com');
    const email2 = Email.create('user@example.com');

    expect(email1.equals(email2)).toBe(true);
  });

  it('considers two emails with different values as distinct', () => {
    const email1 = Email.create('user1@example.com');
    const email2 = Email.create('user2@example.com');

    expect(email1.equals(email2)).toBe(false);
  });
});
