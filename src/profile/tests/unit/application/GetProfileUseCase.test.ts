import { GetProfileUseCase } from '../../../application/GetProfileUseCase';
import { ProfilePort } from '../../../application/ports/ProfilePort';
import { ProfileDTO } from '../../../application/ProfileDTO';

function stubProfilePort(profile: ProfileDTO): ProfilePort {
  return {
    getProfile: async () => profile,
    updateProfile: async () => {},
  };
}

function stubFailingProfilePort(errorMessage: string): ProfilePort {
  return {
    getProfile: async () => {
      throw new Error(errorMessage);
    },
    updateProfile: async () => {},
  };
}

describe('The Profile Retrieval', () => {
  it('retrieves the user profile successfully', async () => {
    const profile: ProfileDTO = { name: 'John Doe', email: 'john@example.com' };
    const profilePort = stubProfilePort(profile);
    const useCase = new GetProfileUseCase(profilePort);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.profile).toEqual(profile);
    expect(result.message).toBeUndefined();
  });

  it('reports an error when the profile cannot be retrieved', async () => {
    const profilePort = stubFailingProfilePort('Network error');
    const useCase = new GetProfileUseCase(profilePort);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Network error');
    expect(result.profile).toBeUndefined();
  });
});
