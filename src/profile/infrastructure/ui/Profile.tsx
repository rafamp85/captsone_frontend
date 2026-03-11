import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useProfile } from './Profile.hook';
import { GetProfileUseCase } from '../../application/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../application/UpdateProfileUseCase';
import { LogoutUseCase } from '../../application/LogoutUseCase';
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
  const hook = useProfile(props);

  useEffect(() => {
    hook.loadProfile();
  }, []);

  if (hook.loggedOut) {
    return <Navigate to={Routes.Login} replace />;
  }

  if (hook.error.isSome()) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.error}>{hook.error.getOrThrow()}</div>
        </div>
      </div>
    );
  }

  if (hook.loading || hook.profile.isNone()) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  return (
    <ProfileForm
      name={hook.profile.getOrThrow().name}
      email={hook.profile.getOrThrow().email}
      updateError={hook.updateError.fold(
        () => null,
        (msg) => msg
      )}
      onSave={hook.updateProfile}
      onLogout={hook.logout}
    />
  );
}

interface FormProps {
  name: string;
  email: string;
  updateError: string | null;
  onSave: (name: string, email: string) => Promise<void>;
  onLogout: () => void;
}

function ProfileForm(props: FormProps) {
  const [name, setName] = useState(props.name);
  const [email, setEmail] = useState(props.email);

  useEffect(() => {
    setName(props.name);
    setEmail(props.email);
  }, [props.name, props.email]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    props.onSave(name, email);
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-email">
              Email
            </label>
            <input
              id="profile-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>
          {props.updateError && <div className={styles.error}>{props.updateError}</div>}
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
