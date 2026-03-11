import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HealthContainer } from '../../../health/infrastructure/ui/Health';
import { LoginContainer } from '../../../auth/infrastructure/ui/Login';
import { VerifyOtpContainer } from '../../../auth/infrastructure/ui/VerifyOtp';
import { ProtectedRoute } from './ProtectedRoute';
import { ProfileContainer } from '../../../profile/infrastructure/ui/Profile';
import { Factory } from '../factory';
import { Routes as AppRoutes } from './routes';

export function App() {
  const tokenPort = Factory.getTokenPort();
  return (
    <BrowserRouter>
      <Routes>
        <Route path={AppRoutes.Home} element={<Navigate to={AppRoutes.Login} replace />} />
        <Route path={AppRoutes.Health} element={<HealthContainer />} />
        <Route path={AppRoutes.Login} element={<LoginContainer />} />
        <Route path={AppRoutes.Verify} element={<VerifyOtpContainer />} />
        <Route
          path={AppRoutes.Profile}
          element={
            <ProtectedRoute tokenPort={tokenPort}>
              <ProfileContainer />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
