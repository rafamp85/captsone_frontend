import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { VerifyOtp } from '../../../../infrastructure/ui/VerifyOtp';
import { VerifyOtpUseCase } from '../../../../application/VerifyOtpUseCase';
import { AuthPort } from '../../../../application/ports/AuthPort';
import { TokenPort } from '../../../../../shared/application/ports/TokenPort';
import { DomainError } from '../../../../../shared/domain/DomainError';
import { Maybe } from '../../../../../shared/domain/Maybe';

function stubAuthPort(token: string): AuthPort {
  return {
    requestOtp: async () => {},
    verifyOtp: async () => token,
  };
}

function stubAuthPortWithInvalidOtp(): AuthPort {
  return {
    requestOtp: async () => {},
    verifyOtp: async () => {
      throw DomainError.createValidation('Invalid OTP');
    },
  };
}

function stubTokenPort(): TokenPort {
  return {
    saveToken: () => {},
    getToken: () => Maybe.none(),
    clearToken: () => {},
  };
}

function TestApp(props: { useCase: VerifyOtpUseCase; tokenPort: TokenPort; initialPath?: string }) {
  return (
    <MemoryRouter initialEntries={[props.initialPath || '/verify?email=user@example.com']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/verify" element={<VerifyOtp useCase={props.useCase} tokenPort={props.tokenPort} />} />
        <Route path="/profile" element={<div>Profile Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('The Verification Screen', () => {
  it('presents OTP input and submit button', () => {
    const tokenPort = stubTokenPort();
    const useCase = new VerifyOtpUseCase(stubAuthPort('jwt-token'), tokenPort);

    render(<TestApp useCase={useCase} tokenPort={tokenPort} />);

    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
  });

  it('presents the email being verified', () => {
    const tokenPort = stubTokenPort();
    const useCase = new VerifyOtpUseCase(stubAuthPort('jwt-token'), tokenPort);

    render(<TestApp useCase={useCase} tokenPort={tokenPort} />);

    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
  });

  it('navigates to profile after successful verification', async () => {
    const tokenPort = stubTokenPort();
    const useCase = new VerifyOtpUseCase(stubAuthPort('jwt-token'), tokenPort);
    const user = userEvent.setup();

    render(<TestApp useCase={useCase} tokenPort={tokenPort} />);
    await user.type(screen.getByPlaceholderText('000000'), '123456');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });
  });

  it('displays error for invalid OTP', async () => {
    const tokenPort = stubTokenPort();
    const useCase = new VerifyOtpUseCase(stubAuthPortWithInvalidOtp(), tokenPort);
    const user = userEvent.setup();

    render(<TestApp useCase={useCase} tokenPort={tokenPort} />);
    await user.type(screen.getByPlaceholderText('000000'), '654321');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid OTP/i)).toBeInTheDocument();
    });
  });

  it('requires email context for verification', async () => {
    const tokenPort = stubTokenPort();
    const useCase = new VerifyOtpUseCase(stubAuthPort('jwt-token'), tokenPort);

    render(<TestApp useCase={useCase} tokenPort={tokenPort} initialPath="/verify" />);

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
