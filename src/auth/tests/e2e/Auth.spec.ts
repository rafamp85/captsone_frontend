import { test, expect } from '@playwright/test';
import { Routes } from '../../../shared/infrastructure/ui/routes';
import { Endpoints } from '../../../shared/infrastructure/http/endpoints';

test.describe('The Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(Routes.Login);
  });

  test('presents the login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar código' })).toBeVisible();
  });

  test('shows error when email is invalid', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('invalid-email');
    await page.getByRole('button', { name: 'Enviar código' }).click();
    await expect(page.getByText('Invalid email format')).toBeVisible();
  });

  test('navigates to verify page on successful OTP request', async ({ page }) => {
    await page.route(`**/api${Endpoints.RequestOtp}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OTP sent' }),
      });
    });
    await page.getByPlaceholder('Email').fill('user@example.com');
    await page.getByRole('button', { name: 'Enviar código' }).click();
    await expect(page).toHaveURL(/\/verify\?email=user%40example\.com/);
  });
});

test.describe('The Verify OTP Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${Routes.Verify}?email=user@example.com`);
  });

  test('presents the OTP verification form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verificar código' })).toBeVisible();
    await expect(page.getByText('user@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('000000')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verificar' })).toBeVisible();
  });

  test('shows error when OTP is invalid', async ({ page }) => {
    await page.route(`**/api${Endpoints.VerifyOtp}`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid OTP' }),
      });
    });
    await page.getByPlaceholder('000000').fill('000000');
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText('Invalid OTP')).toBeVisible();
  });

  test('navigates to profile on successful verification', async ({ page }) => {
    await page.route(`**/api${Endpoints.VerifyOtp}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'jwt-token-123' }),
      });
    });
    await page.getByPlaceholder('000000').fill('123456');
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page).toHaveURL(Routes.Profile);
    await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();
  });
});

test.describe('The Profile Page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto(Routes.Profile);
    await expect(page).toHaveURL(Routes.Login);
  });

  test('shows profile placeholder when authenticated', async ({ page }) => {
    await page.goto(Routes.Login);
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
    });
    await page.goto(Routes.Profile);
    await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();
    await expect(page.getByText('Próximamente')).toBeVisible();
  });
});

test.describe('The Complete Login Flow', () => {
  test('completes full login flow from login to profile', async ({ page }) => {
    await page.route(`**/api${Endpoints.RequestOtp}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OTP sent' }),
      });
    });
    await page.route(`**/api${Endpoints.VerifyOtp}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'jwt-token-123' }),
      });
    });
    await page.goto(Routes.Login);
    await page.getByPlaceholder('Email').fill('user@example.com');
    await page.getByRole('button', { name: 'Enviar código' }).click();
    await expect(page).toHaveURL(/\/verify/);
    await page.getByPlaceholder('000000').fill('123456');
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page).toHaveURL(Routes.Profile);
    await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();
  });
});
