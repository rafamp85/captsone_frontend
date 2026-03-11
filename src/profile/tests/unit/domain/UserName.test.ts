import { UserName } from '../../../domain/value-objects/UserName';

describe('The UserName', () => {
  it('rejects an empty string', () => {
    expect(() => UserName.create('')).toThrow('Name must be between 2 and 100 characters');
  });

  it('rejects a string shorter than 2 characters', () => {
    expect(() => UserName.create('A')).toThrow('Name must be between 2 and 100 characters');
  });

  it('rejects a string longer than 100 characters', () => {
    const longName = 'A'.repeat(101);

    expect(() => UserName.create(longName)).toThrow('Name must be between 2 and 100 characters');
  });

  it('creates from a valid string', () => {
    const userName = UserName.create('John Doe');

    expect(userName.value).toBe('John Doe');
  });

  it('trims whitespace from the value', () => {
    const userName = UserName.create('  John Doe  ');

    expect(userName.value).toBe('John Doe');
  });

  it('considers two user names with the same value as equal', () => {
    const userName = UserName.create('John Doe');
    const other = UserName.create('John Doe');

    expect(userName.equals(other)).toBe(true);
  });

  it('considers two user names with different values as not equal', () => {
    const userName = UserName.create('John Doe');
    const other = UserName.create('Jane Doe');

    expect(userName.equals(other)).toBe(false);
  });

  it('converts to primitives', () => {
    const userName = UserName.create('John Doe');

    expect(userName.toPrimitives()).toBe('John Doe');
  });
});
