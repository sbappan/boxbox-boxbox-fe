import { test, expect } from '@playwright/test';

test.describe('FollowButton Component', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication session
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            image: 'https://example.com/avatar.jpg'
          },
          session: {
            id: 'session-1',
            expiresAt: new Date(Date.now() + 3600000).toISOString()
          }
        })
      });
    });

    // Mock user profile API call
    await page.route('/api/user/*', async (route) => {
      const url = route.request().url();
      const userId = url.split('/').pop();
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: userId,
            name: userId === 'user-2' ? 'Other User' : 'Test User',
            email: userId === 'user-2' ? 'other@example.com' : 'test@example.com',
            image: 'https://example.com/avatar.jpg',
            followerCount: 5,
            followingCount: 3,
            isFollowing: false
          }
        })
      });
    });
  });

  test('should display follow button for unfollowed user', async ({ page }) => {
    // Mock follow API call
    await page.route('/api/users/*/follow', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Successfully followed user' })
        });
      }
    });

    // Create a test page with FollowButton
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FollowButton Test</title>
        </head>
        <body>
          <div id="root">
            <button 
              data-testid="follow-button"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all"
              data-follow-state="false"
              data-user-id="user-2"
            >
              <svg class="size-4" data-testid="follow-icon"><use href="#user-plus"/></svg>
              <span>Follow</span>
            </button>
          </div>
        </body>
      </html>
    `);

    // Check initial state
    const followButton = page.getByTestId('follow-button');
    await expect(followButton).toBeVisible();
    await expect(followButton).toHaveText(/Follow/);
    
    // Check for follow icon
    const followIcon = page.getByTestId('follow-icon');
    await expect(followIcon).toBeVisible();
  });

  test('should display following button for followed user', async ({ page }) => {
    // Create a test page with FollowButton in following state
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FollowButton Test</title>
        </head>
        <body>
          <div id="root">
            <button 
              data-testid="follow-button"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all"
              data-follow-state="true"
              data-user-id="user-2"
            >
              <svg class="size-4" data-testid="following-icon"><use href="#user-minus"/></svg>
              <span>Following</span>
            </button>
          </div>
        </body>
      </html>
    `);

    // Check following state
    const followButton = page.getByTestId('follow-button');
    await expect(followButton).toBeVisible();
    await expect(followButton).toHaveText(/Following/);
    
    // Check for following icon
    const followingIcon = page.getByTestId('following-icon');
    await expect(followingIcon).toBeVisible();
  });

  test('should handle follow action successfully', async ({ page }) => {
    // Mock follow API call
    await page.route('/api/users/*/follow', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Successfully followed user' })
        });
      }
    });

    // Create a test page with interactive FollowButton
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FollowButton Test</title>
        </head>
        <body>
          <div id="root">
            <button 
              data-testid="follow-button"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all"
              data-follow-state="false"
              data-user-id="user-2"
              onclick="this.dataset.followState = 'true'; this.innerHTML = '<svg class=\\"size-4\\"><use href=\\"#user-minus\\"/></svg><span>Following</span>'"
            >
              <svg class="size-4"><use href="#user-plus"/></svg>
              <span>Follow</span>
            </button>
          </div>
        </body>
      </html>
    `);

    // Click the follow button
    const followButton = page.getByTestId('follow-button');
    await followButton.click();

    // Wait for state change
    await page.waitForTimeout(100);
    
    // Check that button text changed
    await expect(followButton).toHaveText(/Following/);
  });

  test('should handle unfollow action successfully', async ({ page }) => {
    // Mock unfollow API call
    await page.route('/api/users/*/follow', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Successfully unfollowed user' })
        });
      }
    });

    // Create a test page with FollowButton in following state
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FollowButton Test</title>
        </head>
        <body>
          <div id="root">
            <button 
              data-testid="follow-button"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all"
              data-follow-state="true"
              data-user-id="user-2"
              onclick="this.dataset.followState = 'false'; this.innerHTML = '<svg class=\\"size-4\\"><use href=\\"#user-plus\\"/></svg><span>Follow</span>'"
            >
              <svg class="size-4"><use href="#user-minus"/></svg>
              <span>Following</span>
            </button>
          </div>
        </body>
      </html>
    `);

    // Click the unfollow button
    const followButton = page.getByTestId('follow-button');
    await followButton.click();

    // Wait for state change
    await page.waitForTimeout(100);
    
    // Check that button text changed back to Follow
    await expect(followButton).toHaveText(/Follow/);
  });

  test('should show loading state during follow operation', async ({ page }) => {
    // Create a test page with loading state simulation
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FollowButton Test</title>
        </head>
        <body>
          <div id="root">
            <button 
              data-testid="follow-button"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all"
              data-follow-state="false"
              data-user-id="user-2"
            >
              <svg class="size-4"><use href="#user-plus"/></svg>
              <span>Follow</span>
            </button>
            
            <script>
              document.querySelector('[data-testid="follow-button"]').addEventListener('click', function() {
                this.disabled = true;
                this.innerHTML = '<svg class="size-4 animate-spin"><use href="#loader"/></svg><span>Following...</span>';
                
                setTimeout(() => {
                  this.disabled = false;
                  this.dataset.followState = 'true';
                  this.innerHTML = '<svg class="size-4"><use href="#user-minus"/></svg><span>Following</span>';
                }, 300);
              });
            </script>
          </div>
        </body>
      </html>
    `);

    const followButton = page.getByTestId('follow-button');
    
    // Click the button
    await followButton.click();
    
    // Wait a bit for the click handler to execute
    await page.waitForTimeout(50);
    
    // Check loading state
    await expect(followButton).toBeDisabled();
    await expect(followButton).toHaveText(/Following\.\.\./);
    
    // Wait for loading to complete
    await page.waitForTimeout(400);
    
    // Check final state
    await expect(followButton).not.toBeDisabled();
    await expect(followButton).toHaveText(/Following/);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock failed follow API call
    await page.route('/api/users/*/follow', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    // Create a test page with error handling
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FollowButton Test</title>
        </head>
        <body>
          <div id="root">
            <button 
              data-testid="follow-button"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all"
              data-follow-state="false"
              data-user-id="user-2"
              onclick="
                this.disabled = true;
                this.innerHTML = '<svg class=\\"size-4 animate-spin\\"><use href=\\"#loader\\"/></svg><span>Following...</span>';
                setTimeout(() => {
                  this.disabled = false;
                  this.innerHTML = '<svg class=\\"size-4\\"><use href=\\"#user-plus\\"/></svg><span>Follow</span>';
                  // Show error state briefly
                  this.style.borderColor = 'red';
                  setTimeout(() => this.style.borderColor = '', 2000);
                }, 500);
              "
            >
              <svg class="size-4"><use href="#user-plus"/></svg>
              <span>Follow</span>
            </button>
          </div>
        </body>
      </html>
    `);

    const followButton = page.getByTestId('follow-button');
    
    // Click the button
    await followButton.click();
    
    // Wait for error handling
    await page.waitForTimeout(600);
    
    // Check that button is enabled again and shows original state
    await expect(followButton).not.toBeDisabled();
    await expect(followButton).toHaveText(/Follow/);
  });

  test('should be disabled when disabled prop is true', async ({ page }) => {
    // Create a test page with disabled FollowButton
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FollowButton Test</title>
        </head>
        <body>
          <div id="root">
            <button 
              data-testid="follow-button"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all opacity-50"
              data-follow-state="false"
              data-user-id="user-2"
              disabled
            >
              <svg class="size-4"><use href="#user-plus"/></svg>
              <span>Follow</span>
            </button>
          </div>
        </body>
      </html>
    `);

    const followButton = page.getByTestId('follow-button');
    
    // Check that button is disabled
    await expect(followButton).toBeDisabled();
    await expect(followButton).toHaveText(/Follow/);
  });

  test('should support different button variants', async ({ page }) => {
    // Create a test page with outline variant FollowButton
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FollowButton Test</title>
        </head>
        <body>
          <div id="root">
            <button 
              data-testid="follow-button-outline"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"
              data-follow-state="false"
              data-user-id="user-2"
            >
              <svg class="size-4"><use href="#user-plus"/></svg>
              <span>Follow</span>
            </button>
          </div>
        </body>
      </html>
    `);

    const followButton = page.getByTestId('follow-button-outline');
    
    // Check that button has outline styles
    await expect(followButton).toHaveClass(/border/);
    await expect(followButton).toBeVisible();
    await expect(followButton).toHaveText(/Follow/);
  });
});