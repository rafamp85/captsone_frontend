import { UpdateProfileUseCase } from '../../../application/UpdateProfileUseCase';
import { ProfilePort } from '../../../application/ports/ProfilePort';

function stubProfilePort(): ProfilePort & { updatedWith: { name: string; email: string } | null } {
  const stub = {
    updatedWith: null as { name: string; email: string } | null,
    getProfile: async () => ({ name: 'John Doe', email: 'john@example.com' }),
    updateProfile: async (name: string, email: string) => {
      stub.updatedWith = { name, email };
    },
  };
  return stub;
}

describe('The Profile Update', () => {
  it('persists the updated name and email', async () => {
    const profilePort = stubProfilePort();
    const useCase = new UpdateProfileUseCase(profilePort);

    const result = await useCase.execute('Jane Doe', 'jane@example.com');

    expect(result.success).toBe(true);
    expect(result.message).toBeUndefined();
    expect(profilePort.updatedWith).toEqual({ name: 'Jane Doe', email: 'jane@example.com' });
  });

  it('rejects an invalid name', async () => {
    const profilePort = stubProfilePort();
    const useCase = new UpdateProfileUseCase(profilePort);

    const result = await useCase.execute('A', 'jane@example.com');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Name must be between 2 and 100 characters');
    expect(profilePort.updatedWith).toBeNull();
  });

  it('rejects an invalid email', async () => {
    const profilePort = stubProfilePort();
    const useCase = new UpdateProfileUseCase(profilePort);

    const result = await useCase.execute('Jane Doe', 'invalid-email');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email format');
    expect(profilePort.updatedWith).toBeNull();
  });

  it('reports an error when the profile service is unavailable', async () => {
    const stub = {
      updatedWith: null as { name: string; email: string } | null,
      getProfile: async () => ({ name: 'John Doe', email: 'john@example.com' }),
      updateProfile: async () => {
        throw new Error('Service unavailable');
      },
    };
    const useCase = new UpdateProfileUseCase(stub);

    const result = await useCase.execute('Jane Doe', 'jane@example.com');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Service unavailable');
  });
});
