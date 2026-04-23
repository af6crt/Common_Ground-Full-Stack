import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByRole('link', { name: '🌱 Common Ground' })).toBeVisible();
});

test('navigation to events page works', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('text=Events');
  await expect(page).toHaveURL(/.*events/);
  await expect(page.getByText('Community Events')).toBeVisible();
});

test('navigation to meals page works', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('text=Meals');
  await expect(page).toHaveURL(/.*meals/);
  await expect(page.getByText('Free Meals Near You')).toBeVisible();
});

test('user can sign up, log in, and join a club', async ({ page }) => {
  const testEmail = `test${Date.now()}@example.com`;
  await page.goto('http://localhost:5173/signup');
  await page.fill('input[placeholder="Full Name"]', 'Test User');
  await page.fill('input[placeholder="Email"]', testEmail);
  await page.fill('input[placeholder="Password (min 6 characters)"]', 'test123');
  await page.click('button:has-text("Create Account")');
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  await expect(page).toHaveURL(/.*dashboard/);

  // Go to homepage and join the first joinable club
  await page.goto('http://localhost:5173');
  const joinButton = page.locator('button:has-text("Join this club")').first();
  const clubCard = joinButton.locator('xpath=ancestor::div[contains(@class, "rounded-2xl")]');
  const clubName = await clubCard.locator('h3').first().textContent();

  // Wait for the join API call to complete
  const responsePromise = page.waitForResponse(
      response => response.url().includes('/clubs/') && response.request().method() === 'POST',
      { timeout: 10000 }
  );
  await joinButton.click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);

  // Refresh the page to get the updated UI state
  await page.reload();
  // Find the same club card by its name and verify its button
  const targetCard = page.locator(`h3:has-text("${clubName}")`).locator('xpath=ancestor::div[contains(@class, "rounded-2xl")]');
  const updatedButton = targetCard.locator('button');
  await expect(updatedButton).toHaveText('✓ Joined', { timeout: 5000 });
  await expect(updatedButton).toBeDisabled();
});

test('existing user can sign in with demo account', async ({ page }) => {
  await page.goto('http://localhost:5173/signin');
  await page.fill('input[placeholder="Email"]', 'demo321@example.com');
  await page.fill('input[placeholder="Password"]', 'demo123');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  await expect(page.getByText(/Hello, Demo User/)).toBeVisible();
});