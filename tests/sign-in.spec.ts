import { test, expect } from '@playwright/test';

test.describe('Sign In Button', () => {
  test('should display Sign In button when user is not authenticated', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header');
    const signInButton = header.getByRole('button', { name: 'Sign In', exact: true });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
  });

  test('should open auth modal when Sign In button is clicked', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header');
    const signInButton = header.getByRole('button', { name: 'Sign In', exact: true });
    await signInButton.click();
    
    const authModal = page.locator('.fixed.inset-0.z-50');
    await expect(authModal).toBeVisible();
    
    const modalTitle = authModal.getByText('Sign In', { exact: true });
    await expect(modalTitle).toBeVisible();
    
    const googleButton = page.getByRole('button', { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible();
    
    const xButton = page.getByRole('button', { name: /Continue with X/i });
    await expect(xButton).toBeVisible();
  });

  test('Sign In button should have correct styling', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header');
    const signInButton = header.getByRole('button', { name: 'Sign In', exact: true });
    
    const buttonClasses = await signInButton.getAttribute('class');
    expect(buttonClasses).toContain('hover:bg-accent');
    expect(buttonClasses).toContain('h-8');
  });

  test('should close auth modal when close button is clicked', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header');
    const signInButton = header.getByRole('button', { name: 'Sign In', exact: true });
    await signInButton.click();
    
    const authModal = page.locator('.fixed.inset-0.z-50');
    await expect(authModal).toBeVisible();
    
    const closeButton = page.locator('button').filter({ hasText: '✕' });
    await closeButton.click();
    
    await expect(authModal).not.toBeVisible();
  });

  test('Sign In button should be in the header', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header');
    const signInButton = header.getByRole('button', { name: 'Sign In', exact: true });
    
    await expect(signInButton).toBeVisible();
  });
});