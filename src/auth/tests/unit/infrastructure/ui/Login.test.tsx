import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Login } from '../../../../infrastructure/ui/Login';
import { RequestOtpUseCase } from '../../../../application/RequestOtpUseCase';
import { AuthPort } from '../../../../application/ports/AuthPort';
import { TokenPort } from '../../../../../shared/application/ports/TokenPort';
import { Maybe } from '../../../../../shared/domain/Maybe';

function stubAuthPort(): AuthPort {
  return {
    requestOtp: async () => {},
    verifyOtp: async () => 'token',
  };
}

function stubTokenPort(): TokenPort {
  return {
    saveToken: () => {},
    getToken: () => Maybe.none(),
    clearToken: () => {},
  };
}

function stubTokenPortWithToken(token: string): TokenPort {
  return {
    saveToken: () => {},
    getToken: () => Maybe.some(token),
    clearToken: () => {},
  };
}

function TestApp(props: { useCase: RequestOtpUseCase; tokenPort: TokenPort; initialPath?: string }) {
  return (
    <MemoryRouter initialEntries={[props.initialPath || '/login']}>
      <Routes>
        <Route path="/login" element={<Login useCase={props.useCase} tokenPort={props.tokenPort} />} />
        <Route path="/verify" element={<div>Verify Page</div>} />
        <Route path="/profile" element={<div>Profile Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('The Login Screen', () => {
  it('presents email input and submit button', () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());
    const tokenPort = stubTokenPort();

    render(<TestApp useCase={useCase} tokenPort={tokenPort} />);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar código/i })).toBeInTheDocument();
  });

  it('prevents submission without email', () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());
    const tokenPort = stubTokenPort();

    render(<TestApp useCase={useCase} tokenPort={tokenPort} />);

    expect(screen.getByRole('button', { name: /enviar código/i })).toBeDisabled();
  });

  it('navigates to verification after OTP sent', async () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());
    const tokenPort = stubTokenPort();
    const user = userEvent.setup();

    render(<TestApp useCase={useCase} tokenPort={tokenPort} />);
    await user.type(screen.getByPlaceholderText(/email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /enviar código/i }));

    await waitFor(() => {
      expect(screen.getByText('Verify Page')).toBeInTheDocument();
    });
  });

  it('displays error for invalid email', async () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());
    const tokenPort = stubTokenPort();
    const user = userEvent.setup();

    render(<TestApp useCase={useCase} tokenPort={tokenPort} />);
    await user.type(screen.getByPlaceholderText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /enviar código/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('navigates to profile for authenticated users', async () => {
    const useCase = new RequestOtpUseCase(stubAuthPort());
    const tokenPort = stubTokenPortWithToken('existing-token');

    render(<TestApp useCase={useCase} tokenPort={tokenPort} />);

    await waitFor(() => {
      expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });
  });
});
