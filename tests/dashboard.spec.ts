import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Better Auth session endpoint to simulate authenticated user
    await page.route('**/api/auth/get-session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { 
            id: 'test-user', 
            name: 'Test User', 
            email: 'test@example.com' 
          },
          session: { 
            id: 'test-session',
            userId: 'test-user',
            expiresAt: new Date(Date.now() + 86400000).toISOString()
          }
        })
      });
    });
  });

  test.describe('Page Structure', () => {
    test('should display the correct header and subtitle with mixed data', async ({ page }) => {
      // Mock successful API responses with mixed data
      const mockRaces = [
        { id: '1', name: 'Monaco Grand Prix', date: '2024-05-26', circuit: 'Circuit de Monaco' },
        { id: '2', name: 'Canadian Grand Prix', date: '2024-06-09', circuit: 'Circuit Gilles Villeneuve' }
      ];

      const mockReviews = [
        {
          id: 'r1',
          raceId: '1',
          userId: 'u1',
          rating: 5,
          comment: 'Amazing race with great overtakes!',
          date: '2024-05-27T10:00:00Z',
          likeCount: 10,
          author: 'John Doe',
          text: 'Amazing race with great overtakes!',
          isLikedByUser: false
        },
        {
          id: 'r2',
          raceId: '2',
          userId: 'u2',
          rating: 4,
          comment: 'Great strategy battles throughout',
          date: '2024-06-10T15:00:00Z',
          likeCount: 5,
          author: 'Jane Smith',
          text: 'Great strategy battles throughout',
          isLikedByUser: true
        }
      ];

      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRaces)
        });
      });

      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockReviews)
        });
      });

      await page.goto('/');
      
      // Wait for content to load
      await page.waitForSelector('h1', { timeout: 10000 });
      
      const heading = page.getByRole('heading', { name: 'All Reviews' });
      await expect(heading).toBeVisible();
      
      const subtitle = page.getByText('Browse reviews from all Formula 1 races');
      await expect(subtitle).toBeVisible();
    });

    test('should have proper container styling', async ({ page }) => {
      // Mock empty responses for basic structure test
      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.goto('/');
      
      await page.waitForSelector('h1', { timeout: 10000 });
      // Target the specific dashboard container with space-y-8 class which is unique
      const container = page.locator('.container.mx-auto.max-w-2xl.p-4.space-y-8');
      await expect(container).toBeVisible();
    });
  });

  test.describe('Error State', () => {
    test('should display error message when API fails', async ({ page }) => {
      // Simulate API error
      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.goto('/');
      
      // Wait for error to appear
      await page.waitForSelector('[data-testid="error-alert"]', { timeout: 10000 });
      
      const errorMessage = page.getByText('Failed to load reviews. Please try refreshing the page.');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state message when no reviews exist', async ({ page }) => {
      // Mock empty reviews response
      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.goto('/');
      
      await page.waitForSelector('h1', { timeout: 10000 });
      
      const emptyMessage = page.getByText('No reviews yet. Be the first to review a race!');
      await expect(emptyMessage).toBeVisible();
    });
  });

  test.describe('Reviews Display and Sorting', () => {
    test('should display reviews sorted by date with newest first', async ({ page }) => {
      const mockRaces = [
        { id: '1', name: 'Monaco Grand Prix', date: '2024-05-26', circuit: 'Circuit de Monaco' }
      ];

      // Create reviews with different dates to test sorting
      const mockReviews = [
        {
          id: 'r1',
          raceId: '1',
          userId: 'u1',
          rating: 5,
          comment: 'Older review from May 20th',
          date: '2024-05-20T10:00:00Z',
          likeCount: 10,
          author: 'John Doe',
          text: 'Older review from May 20th',
          isLikedByUser: false
        },
        {
          id: 'r2',
          raceId: '1',
          userId: 'u2',
          rating: 4,
          comment: 'Newer review from May 25th',
          date: '2024-05-25T15:00:00Z',
          likeCount: 5,
          author: 'Jane Smith',
          text: 'Newer review from May 25th',
          isLikedByUser: true
        }
      ];

      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRaces)
        });
      });

      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockReviews)
        });
      });

      await page.goto('/');
      
      // Wait for reviews to load
      await page.waitForSelector('[data-testid="review-item"]', { timeout: 10000 });
      
      const reviewItems = page.locator('[data-testid="review-item"]');
      await expect(reviewItems).toHaveCount(2);
      
      // Check that newer review appears first (review sorting by date)
      const firstReviewText = await reviewItems.first().textContent();
      expect(firstReviewText).toContain('Newer review from May 25th');
    });

    test('should handle reviews with missing race data gracefully', async ({ page }) => {
      const mockRaces = [
        { id: '1', name: 'Monaco Grand Prix', date: '2024-05-26', circuit: 'Circuit de Monaco' }
      ];

      const mockReviews = [
        {
          id: 'r1',
          raceId: '1',
          userId: 'u1',
          rating: 5,
          comment: 'Review with valid race',
          date: '2024-05-27T10:00:00Z',
          likeCount: 10,
          author: 'John Doe',
          text: 'Review with valid race',
          isLikedByUser: false
        },
        {
          id: 'r2',
          raceId: '999', // Non-existent race ID
          userId: 'u2',
          rating: 4,
          comment: 'Review with invalid race ID',
          date: '2024-06-10T15:00:00Z',
          likeCount: 5,
          author: 'Jane Smith',
          text: 'Review with invalid race ID',
          isLikedByUser: false
        }
      ];

      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRaces)
        });
      });

      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockReviews)
        });
      });

      await page.goto('/');
      
      // Wait for reviews to load
      await page.waitForSelector('[data-testid="review-item"]', { timeout: 10000 });
      
      // Both reviews should still be displayed even with missing race data
      const reviewItems = page.locator('[data-testid="review-item"]');
      await expect(reviewItems).toHaveCount(2);
      
      // Verify the valid race has a clickable link
      const validRaceLink = page.locator('a').filter({ hasText: 'Monaco Grand Prix' });
      await expect(validRaceLink).toBeVisible();
    });
  });

  test.describe('Race Name Links', () => {
    test('should make race names clickable links that work properly', async ({ page }) => {
      const mockRaces = [
        { id: '1', name: 'Monaco Grand Prix', date: '2024-05-26', circuit: 'Circuit de Monaco' }
      ];

      const mockReviews = [
        {
          id: 'r1',
          raceId: '1',
          userId: 'u1',
          rating: 5,
          comment: 'Amazing Monaco race!',
          date: '2024-05-27T10:00:00Z',
          likeCount: 10,
          author: 'John Doe',
          text: 'Amazing Monaco race!',
          isLikedByUser: false
        }
      ];

      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRaces)
        });
      });

      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockReviews)
        });
      });

      await page.goto('/');
      
      // Wait for reviews to load
      await page.waitForSelector('[data-testid="review-item"]', { timeout: 10000 });
      
      // Find the race name link
      const raceLink = page.locator('a').filter({ hasText: 'Monaco Grand Prix' });
      await expect(raceLink).toBeVisible();
      
      // Check that it has the correct href
      const href = await raceLink.getAttribute('href');
      expect(href).toBe('/race/1');
    });

    test('should navigate to race page when race name is clicked', async ({ page }) => {
      const mockRaces = [
        { id: '1', name: 'Monaco Grand Prix', date: '2024-05-26', circuit: 'Circuit de Monaco' }
      ];

      const mockReviews = [
        {
          id: 'r1',
          raceId: '1',
          userId: 'u1',
          rating: 5,
          comment: 'Great race at Monaco!',
          date: '2024-05-27T10:00:00Z',
          likeCount: 10,
          author: 'John Doe',
          text: 'Great race at Monaco!',
          isLikedByUser: false
        }
      ];

      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRaces)
        });
      });

      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockReviews)
        });
      });

      await page.goto('/');
      
      // Wait for reviews to load
      await page.waitForSelector('[data-testid="review-item"]', { timeout: 10000 });
      
      // Click on race name
      const raceLink = page.locator('a').filter({ hasText: 'Monaco Grand Prix' });
      await raceLink.click();
      
      // Should navigate to race page
      await expect(page).toHaveURL('/race/1');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.goto('/');
      
      await page.waitForSelector('h1', { timeout: 10000 });
      
      // Main heading should be h1
      const h1 = page.locator('h1');
      await expect(h1).toHaveText('All Reviews');
      
      // Should only have one h1
      await expect(h1).toHaveCount(1);
    });

    test('should have proper focus states for interactive elements', async ({ page }) => {
      const mockRaces = [
        { id: '1', name: 'Monaco Grand Prix', date: '2024-05-26', circuit: 'Circuit de Monaco' }
      ];

      const mockReviews = [
        {
          id: 'r1',
          raceId: '1',
          userId: 'u1',
          rating: 5,
          comment: 'Accessible review test',
          date: '2024-05-27T10:00:00Z',
          likeCount: 10,
          author: 'John Doe',
          text: 'Accessible review test',
          isLikedByUser: false
        }
      ];

      await page.route('**/api/races', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRaces)
        });
      });

      await page.route('**/api/reviews', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockReviews)
        });
      });

      await page.goto('/');
      
      // Wait for reviews to load
      await page.waitForSelector('[data-testid="review-item"]', { timeout: 10000 });
      
      // Check for proper focus states
      const firstLink = page.locator('a').first();
      await firstLink.focus();
      await expect(firstLink).toBeFocused();
    });
  });
});