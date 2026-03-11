import { useState } from 'react';
import { Maybe } from '../../../shared/domain/Maybe';
import { ProfileDTO } from '../../application/ProfileDTO';
import { GetProfileUseCase } from '../../application/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../application/UpdateProfileUseCase';
import { LogoutUseCase } from '../../application/LogoutUseCase';

interface ProfileDeps {
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  logoutUseCase: LogoutUseCase;
}

interface ProfileState {
  profile: Maybe<ProfileDTO>;
  loading: boolean;
  error: Maybe<string>;
  updateError: Maybe<string>;
  loggedOut: boolean;
  editName: string;
}

const initialState: ProfileState = {
  profile: Maybe.none(),
  loading: false,
  error: Maybe.none(),
  updateError: Maybe.none(),
  loggedOut: false,
  editName: '',
};

export function useProfile(deps: ProfileDeps) {
  const [state, setState] = useState<ProfileState>(initialState);

  const loadProfile = async () => {
    setState((prev) => ({ ...prev, loading: true, error: Maybe.none() }));
    const result = await deps.getProfileUseCase.execute();
    if (result.success && result.profile) {
      setState((prev) => ({
        ...prev,
        profile: Maybe.some(result.profile!),
        editName: result.profile!.name,
        loading: false,
      }));
    } else {
      setState((prev) => ({ ...prev, error: Maybe.some(result.message ?? 'Unknown error'), loading: false }));
    }
  };

  const updateProfile = async () => {
    setState((prev) => ({ ...prev, updateError: Maybe.none() }));
    const result = await deps.updateProfileUseCase.execute(state.editName);
    if (result.success) {
      await loadProfile();
    } else {
      setState((prev) => ({ ...prev, updateError: Maybe.some(result.message ?? 'Unknown error') }));
    }
  };

  const changeEditName = (name: string) => {
    setState((prev) => ({ ...prev, editName: name }));
  };

  const logout = () => {
    deps.logoutUseCase.execute();
    setState((prev) => ({ ...prev, loggedOut: true }));
  };

  return {
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    updateError: state.updateError,
    loggedOut: state.loggedOut,
    editName: state.editName,
    loadProfile,
    updateProfile,
    changeEditName,
    logout,
  };
}
