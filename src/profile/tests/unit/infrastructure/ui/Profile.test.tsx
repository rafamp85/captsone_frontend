import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Profile } from '../../../../infrastructure/ui/Profile';
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

interface ProfileDeps {
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  logoutUseCase: LogoutUseCase;
}

function createDeps(profilePort: ProfilePort, tokenPort?: TokenPort): ProfileDeps {
  const token = tokenPort ?? stubTokenPort();
  return {
    getProfileUseCase: new GetProfileUseCase(profilePort),
    updateProfileUseCase: new UpdateProfileUseCase(profilePort),
    logoutUseCase: new LogoutUseCase(token),
  };
}

function renderProfile(deps: ProfileDeps) {
  return render(
    <MemoryRouter>
      <Profile {...deps} />
    </MemoryRouter>
  );
}

describe('The Profile Page', () => {
  const profile: ProfileDTO = { name: 'John Doe', email: 'john@example.com' };

  it('shows a loading message while fetching the profile', async () => {
    const deps = createDeps(stubProfilePort(profile));

    renderProfile(deps);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
    });
  });

  it('presents the user name as editable and email as read-only', async () => {
    const deps = createDeps(stubProfilePort(profile));

    renderProfile(deps);

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('John Doe');
      const emailInput = screen.getByDisplayValue('john@example.com');
      expect(nameInput).not.toHaveAttribute('readOnly');
      expect(emailInput).toHaveAttribute('readOnly');
    });
  });

  it('presents an error with a retry option when the profile cannot be loaded', async () => {
    const deps = createDeps(stubFailingProfilePort('Connection refused'));

    renderProfile(deps);

    await waitFor(() => {
      expect(screen.getByText('Connection refused')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  it('saves the edited name', async () => {
    const user = userEvent.setup();
    let updatedName: string | null = null;
    const profilePort: ProfilePort = {
      getProfile: async () => profile,
      updateProfile: async (name: string) => {
        updatedName = name;
      },
    };
    const deps = createDeps(profilePort);

    renderProfile(deps);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('John Doe');
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(updatedName).toBe('Jane Doe');
    });
  });

  it('offers a logout option', async () => {
    const deps = createDeps(stubProfilePort(profile));

    renderProfile(deps);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    });
  });
});
