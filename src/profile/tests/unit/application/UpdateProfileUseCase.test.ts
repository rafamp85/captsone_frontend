import { UpdateProfileUseCase } from '../../../application/UpdateProfileUseCase';
import { ProfilePort } from '../../../application/ports/ProfilePort';

function stubProfilePort(): ProfilePort & { updatedWith: string | null } {
  const stub = {
    updatedWith: null as string | null,
    getProfile: async () => ({ name: 'John Doe', email: 'john@example.com' }),
    updateProfile: async (name: string) => {
      stub.updatedWith = name;
    },
  };
  return stub;
}

describe('The Profile Update', () => {
  it('persists the updated name', async () => {
    const profilePort = stubProfilePort();
    const useCase = new UpdateProfileUseCase(profilePort);

    const result = await useCase.execute('Jane Doe');

    expect(result.success).toBe(true);
    expect(result.message).toBeUndefined();
    expect(profilePort.updatedWith).toBe('Jane Doe');
  });

  it('rejects an invalid name', async () => {
    const profilePort = stubProfilePort();
    const useCase = new UpdateProfileUseCase(profilePort);

    const result = await useCase.execute('A');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Name must be between 2 and 100 characters');
    expect(profilePort.updatedWith).toBeNull();
  });

  it('reports an error when the profile service is unavailable', async () => {
    const stub = {
      getProfile: async () => ({ name: 'John Doe', email: 'john@example.com' }),
      updateProfile: async () => {
        throw new Error('Service unavailable');
      },
    };
    const useCase = new UpdateProfileUseCase(stub);

    const result = await useCase.execute('Jane Doe');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Service unavailable');
  });
});
