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
  it('returns the user profile', async () => {
    const profile: ProfileDTO = { name: 'John Doe', email: 'john@example.com' };
    const profilePort = stubProfilePort(profile);
    const useCase = new GetProfileUseCase(profilePort);

    const result = await useCase.execute();

    expect(result).toEqual({ success: true, profile });
  });

  it('returns error when profile retrieval fails', async () => {
    const profilePort = stubFailingProfilePort('Network error');
    const useCase = new GetProfileUseCase(profilePort);

    const result = await useCase.execute();

    expect(result).toEqual({ success: false, message: 'Network error' });
  });
});
