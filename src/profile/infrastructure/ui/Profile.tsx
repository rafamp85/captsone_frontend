import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useProfile } from './Profile.hook';
import { GetProfileUseCase } from '../../application/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../application/UpdateProfileUseCase';
import { LogoutUseCase } from '../../application/LogoutUseCase';
import { Maybe } from '../../../shared/domain/Maybe';
import { Factory } from '../../../shared/infrastructure/factory';
import { Routes } from '../../../shared/infrastructure/ui/routes';
import styles from './Profile.module.css';

export function ProfileContainer() {
  const getProfileUseCase = Factory.createGetProfileUseCase();
  const updateProfileUseCase = Factory.createUpdateProfileUseCase();
  const logoutUseCase = Factory.createLogoutUseCase();
  return (
    <Profile
      getProfileUseCase={getProfileUseCase}
      updateProfileUseCase={updateProfileUseCase}
      logoutUseCase={logoutUseCase}
    />
  );
}

interface Props {
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  logoutUseCase: LogoutUseCase;
}

export function Profile(props: Props) {
  const profileState = useProfile(props);

  useEffect(() => {
    profileState.loadProfile();
  }, []);

  if (profileState.loggedOut) {
    return <Navigate to={Routes.Login} replace />;
  }

  return profileState.error.fold(
    () =>
      profileState.profile.fold(
        () => (
          <div className={styles.container}>
            <div className={styles.loading}>Loading profile...</div>
          </div>
        ),
        (profile) => (
          <ProfileForm
            editName={profileState.editName}
            email={profile.email}
            updateError={profileState.updateError}
            onChangeName={profileState.changeEditName}
            onSave={profileState.updateProfile}
            onLogout={profileState.logout}
          />
        )
      ),
    (errorMessage) => (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.error}>{errorMessage}</div>
          <button className={styles.retryButton} onClick={profileState.loadProfile}>
            Retry
          </button>
        </div>
      </div>
    )
  );
}

interface FormProps {
  editName: string;
  email: string;
  updateError: Maybe<string>;
  onChangeName: (name: string) => void;
  onSave: () => Promise<void>;
  onLogout: () => void;
}

function ProfileForm(props: FormProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    props.onSave();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Profile</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={props.editName}
              onChange={(e) => props.onChangeName(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-email">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={props.email}
              readOnly
              className={`${styles.input} ${styles.inputReadonly}`}
            />
          </div>
          {props.updateError.fold(
            () => null,
            (message) => (
              <div className={styles.error}>{message}</div>
            )
          )}
          <button type="submit" className={styles.saveButton}>
            Save
          </button>
        </form>
        <button type="button" className={styles.logoutButton} onClick={props.onLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}
