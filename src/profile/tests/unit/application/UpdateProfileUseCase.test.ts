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
  it('updates name and email via port', async () => {
    const profilePort = stubProfilePort();
    const useCase = new UpdateProfileUseCase(profilePort);

    const result = await useCase.execute('Jane Doe', 'jane@example.com');

    expect(result).toEqual({ success: true });
    expect(profilePort.updatedWith).toEqual({ name: 'Jane Doe', email: 'jane@example.com' });
  });

  it('fails with invalid name', async () => {
    const profilePort = stubProfilePort();
    const useCase = new UpdateProfileUseCase(profilePort);

    const result = await useCase.execute('A', 'jane@example.com');

    expect(result).toEqual({ success: false, message: 'Name must be between 2 and 100 characters' });
    expect(profilePort.updatedWith).toBeNull();
  });

  it('fails with invalid email', async () => {
    const profilePort = stubProfilePort();
    const useCase = new UpdateProfileUseCase(profilePort);

    const result = await useCase.execute('Jane Doe', 'invalid-email');

    expect(result).toEqual({ success: false, message: 'Invalid email format' });
    expect(profilePort.updatedWith).toBeNull();
  });
});
