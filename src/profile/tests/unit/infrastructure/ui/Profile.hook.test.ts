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

  it('starts with no profile data and idle state', () => {
    const deps = createHookDeps(stubProfilePort(profile));

    const { result } = renderHook(() => useProfile(deps));

    expect(result.current.profile.isNone()).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error.isNone()).toBe(true);
  });

  it('provides the profile data after loading', async () => {
    const deps = createHookDeps(stubProfilePort(profile));
    const { result } = renderHook(() => useProfile(deps));

    await act(async () => {
      await result.current.loadProfile();
    });

    expect(result.current.profile.isSome()).toBe(true);
    expect(result.current.profile.getOrThrow()).toEqual(profile);
    expect(result.current.loading).toBe(false);
  });

  it('exposes the error when profile loading fails', async () => {
    const deps = createHookDeps(stubFailingProfilePort('Network error'));
    const { result } = renderHook(() => useProfile(deps));

    await act(async () => {
      await result.current.loadProfile();
    });

    expect(result.current.error.isSome()).toBe(true);
    expect(result.current.error.getOrThrow()).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });

  it('refreshes profile data after a successful update', async () => {
    const updatedProfile: ProfileDTO = { name: 'Jane Doe', email: 'john@example.com' };
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

    act(() => {
      result.current.changeEditName('Jane Doe');
    });

    await act(async () => {
      await result.current.updateProfile();
    });

    expect(result.current.profile.getOrThrow()).toEqual(updatedProfile);
  });

  it('exposes the validation error on failed update', async () => {
    const deps = createHookDeps(stubProfilePort(profile));
    const { result } = renderHook(() => useProfile(deps));

    act(() => {
      result.current.changeEditName('A');
    });

    await act(async () => {
      await result.current.updateProfile();
    });

    expect(result.current.updateError.isSome()).toBe(true);
    expect(result.current.updateError.getOrThrow()).toBe('Name must be between 2 and 100 characters');
  });

  it('marks the user as logged out after logout', async () => {
    const tokenPort = stubTokenPort();
    const deps = createHookDeps(stubProfilePort(profile), tokenPort);
    const { result } = renderHook(() => useProfile(deps));

    act(() => {
      result.current.logout();
    });

    expect(result.current.loggedOut).toBe(true);
  });
});
