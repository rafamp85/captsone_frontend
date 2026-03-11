import { renderHook, act } from '@testing-library/react';
import { useProfile } from '../../../../infrastructure/ui/Profile.hook';
import { GetProfileUseCase } from '../../../../application/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../../../application/UpdateProfileUseCase';
import { LogoutUseCase } from '../../../../application/LogoutUseCase';
import { ProfilePort } from '../../../../application/ports/ProfilePort';
import { ProfileDTO } from '../../../../application/ProfileDTO';
import { TokenPort } from '../../../../../shared/application/ports/TokenPort';
import { Maybe } from '../../../../../shared/domain/Maybe';

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

function stubTokenPort(): TokenPort {
  return {
    saveToken: () => {},
    getToken: () => Maybe.some('token'),
    clearToken: () => {},
  };
}

function createHookDeps(profilePort: ProfilePort, tokenPort?: TokenPort) {
  const token = tokenPort ?? stubTokenPort();
  return {
    getProfileUseCase: new GetProfileUseCase(profilePort),
    updateProfileUseCase: new UpdateProfileUseCase(profilePort),
    logoutUseCase: new LogoutUseCase(token),
  };
}

describe('The Profile Hook', () => {
  const profile: ProfileDTO = { name: 'John Doe', email: 'john@example.com' };

  it('initializes with no data and idle state', () => {
    const deps = createHookDeps(stubProfilePort(profile));

    const { result } = renderHook(() => useProfile(deps));

    expect(result.current.profile.isNone()).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error.isNone()).toBe(true);
  });

  it('loads profile data when requested', async () => {
    const deps = createHookDeps(stubProfilePort(profile));
    const { result } = renderHook(() => useProfile(deps));

    await act(async () => {
      await result.current.loadProfile();
    });

    expect(result.current.profile.isSome()).toBe(true);
    expect(result.current.profile.getOrThrow()).toEqual(profile);
    expect(result.current.loading).toBe(false);
  });

  it('captures error when profile loading fails', async () => {
    const deps = createHookDeps(stubFailingProfilePort('Network error'));
    const { result } = renderHook(() => useProfile(deps));

    await act(async () => {
      await result.current.loadProfile();
    });

    expect(result.current.error.isSome()).toBe(true);
    expect(result.current.error.getOrThrow()).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });

  it('updates profile and reloads data', async () => {
    const updatedProfile: ProfileDTO = { name: 'Jane Doe', email: 'jane@example.com' };
    let callCount = 0;
    const profilePort: ProfilePort = {
      getProfile: async () => {
        callCount++;
        return callCount === 1 ? profile : updatedProfile;
      },
      updateProfile: async () => {},
    };
    const deps = createHookDeps(profilePort);
    const { result } = renderHook(() => useProfile(deps));

    await act(async () => {
      await result.current.loadProfile();
    });
    expect(result.current.profile.getOrThrow()).toEqual(profile);

    await act(async () => {
      await result.current.updateProfile('Jane Doe', 'jane@example.com');
    });

    expect(result.current.profile.getOrThrow()).toEqual(updatedProfile);
  });

  it('captures update error message', async () => {
    const deps = createHookDeps(stubProfilePort(profile));
    const { result } = renderHook(() => useProfile(deps));

    await act(async () => {
      await result.current.updateProfile('A', 'jane@example.com');
    });

    expect(result.current.updateError.isSome()).toBe(true);
    expect(result.current.updateError.getOrThrow()).toBe('Name must be between 2 and 100 characters');
  });

  it('signals logout when executed', async () => {
    const tokenPort = stubTokenPort();
    const deps = createHookDeps(stubProfilePort(profile), tokenPort);
    const { result } = renderHook(() => useProfile(deps));

    act(() => {
      result.current.logout();
    });

    expect(result.current.loggedOut).toBe(true);
  });
});
