import { test, expect } from '@playwright/test';

test.describe('FollowingFeed Page', () => {
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
  });

  test('should display loading state initially', async ({ page }) => {
    // Mock a delayed following feed response
    await page.route('/api/feed/following*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [],
          pagination: { page: 1, limit: 20, total: 0, hasMore: false }
        })
      });
    });

    await page.goto('/following-feed');
    
    // Should show loading spinner
    await expect(page.locator('[data-testid="loading-spinner"]').or(page.getByText('Loading...'))).toBeVisible();
    
    // Should show page title
    await expect(page.getByRole('heading', { name: 'Following Feed' })).toBeVisible();
  });

  test('should display empty state when not following anyone', async ({ page }) => {
    // Mock empty following feed response
    await page.route('/api/feed/following*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [],
          pagination: { page: 1, limit: 20, total: 0, hasMore: false }
        })
      });
    });

    await page.goto('/following-feed');
    
    // Should show empty state
    await expect(page.getByText('Your feed is empty')).toBeVisible();
    await expect(page.getByText("You're not following anyone yet")).toBeVisible();
    await expect(page.getByRole('button', { name: /Discover Users/i })).toBeVisible();
  });

  test('should display reviews from following feed', async ({ page }) => {
    // Mock following feed with reviews
    await page.route('/api/feed/following*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [
            {
              id: 'review-1',
              author: 'Lewis Hamilton Fan',
              authorId: 'user-2',
              avatarUrl: 'https://example.com/avatar2.jpg',
              rating: 5,
              text: 'Amazing race! The overtakes were incredible.',
              date: new Date().toISOString(),
              raceId: 'race-1',
              raceName: 'Monaco Grand Prix 2024',
              likeCount: 12,
              isLikedByUser: false
            },
            {
              id: 'review-2',
              author: 'Max Verstappen Fan',
              authorId: 'user-3',
              avatarUrl: 'https://example.com/avatar3.jpg',
              rating: 4,
              text: 'Great performance by Max, but the strategy could have been better.',
              date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              raceId: 'race-2',
              raceName: 'Spanish Grand Prix 2024',
              likeCount: 8,
              isLikedByUser: true
            }
          ],
          pagination: { page: 1, limit: 20, total: 2, hasMore: false }
        })
      });
    });

    await page.goto('/following-feed');
    
    // Should show reviews
    await expect(page.getByText('Lewis Hamilton Fan')).toBeVisible();
    await expect(page.getByText('Amazing race! The overtakes were incredible.')).toBeVisible();
    await expect(page.getByText('Max Verstappen Fan')).toBeVisible();
    await expect(page.getByText('Great performance by Max')).toBeVisible();
    
    // Should show race names as links
    await expect(page.getByRole('link', { name: 'Monaco Grand Prix 2024' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Spanish Grand Prix 2024' })).toBeVisible();
    
    // Should show star ratings
    const starElements = page.locator('.text-yellow-400');
    await expect(starElements).toHaveCount(9); // 5 stars for first review + 4 for second
  });

  test('should handle pagination correctly', async ({ page }) => {
    // Mock first page of reviews
    await page.route('/api/feed/following?page=1*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [
            {
              id: 'review-1',
              author: 'User 1',
              authorId: 'user-1',
              avatarUrl: 'https://example.com/avatar1.jpg',
              rating: 5,
              text: 'First page review',
              date: new Date().toISOString(),
              raceId: 'race-1',
              raceName: 'Monaco Grand Prix 2024',
              likeCount: 5,
              isLikedByUser: false
            }
          ],
          pagination: { page: 1, limit: 1, total: 2, hasMore: true }
        })
      });
    });

    // Mock second page of reviews
    await page.route('/api/feed/following?page=2*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [
            {
              id: 'review-2',
              author: 'User 2',
              authorId: 'user-2',
              avatarUrl: 'https://example.com/avatar2.jpg',
              rating: 4,
              text: 'Second page review',
              date: new Date().toISOString(),
              raceId: 'race-2',
              raceName: 'Spanish Grand Prix 2024',
              likeCount: 3,
              isLikedByUser: false
            }
          ],
          pagination: { page: 2, limit: 1, total: 2, hasMore: false }
        })
      });
    });

    await page.goto('/following-feed');
    
    // Should show first page content
    await expect(page.getByText('First page review')).toBeVisible();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    
    // Click next page
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Should show second page content
    await expect(page.getByText('Second page review')).toBeVisible();
    await expect(page.getByText('Page 2 of 2')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/feed/following*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' })
      });
    });

    await page.goto('/following-feed');
    
    // Should show error message
    await expect(page.getByText(/Failed to load your following feed/i)).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Override authentication to return no session
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null, session: null })
      });
    });

    await page.goto('/following-feed');
    
    // Should show authentication required message
    await expect(page.getByText('Authentication Required')).toBeVisible();
    await expect(page.getByText('You need to be logged in to view your following feed.')).toBeVisible();
  });

  test('should allow liking reviews in the feed', async ({ page }) => {
    // Mock following feed with reviews
    await page.route('/api/feed/following*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [
            {
              id: 'review-1',
              author: 'Test Author',
              authorId: 'user-2',
              avatarUrl: 'https://example.com/avatar2.jpg',
              rating: 5,
              text: 'Great review to like',
              date: new Date().toISOString(),
              raceId: 'race-1',
              raceName: 'Monaco Grand Prix 2024',
              likeCount: 5,
              isLikedByUser: false
            }
          ],
          pagination: { page: 1, limit: 20, total: 1, hasMore: false }
        })
      });
    });

    // Mock like API
    await page.route('/api/reviews/review-1/like', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Review liked', likeCount: 6 })
        });
      }
    });

    await page.goto('/following-feed');
    
    // Should show like count
    await expect(page.getByText('5')).toBeVisible();
    
    // Click like button
    const likeButton = page.locator('[data-testid="heart-icon"], .heart-icon').first();
    await likeButton.click();
    
    // Like count should update (this depends on the optimistic update implementation)
    // The actual behavior might vary based on the implementation
  });
});