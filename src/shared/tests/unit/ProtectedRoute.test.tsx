import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../infrastructure/ui/ProtectedRoute';
import { TokenPort } from '../../application/ports/TokenPort';
import { Maybe } from '../../domain/Maybe';

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

function TestApp(props: { tokenPort: TokenPort; initialPath: string }) {
  return (
    <MemoryRouter initialEntries={[props.initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute tokenPort={props.tokenPort}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('The Protected Route', () => {
  it('allows access to authenticated users', () => {
    const tokenPort = stubTokenPortWithToken('valid-token');

    render(<TestApp tokenPort={tokenPort} initialPath="/profile" />);

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('requires authentication for access', () => {
    const tokenPort = stubTokenPort();

    render(<TestApp tokenPort={tokenPort} initialPath="/profile" />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
