# useFollow Hook Test Specifications

This document outlines the test specifications for the `useFollow` hook. While the project currently uses Playwright for E2E testing rather than unit testing frameworks, these specifications define the expected behavior that should be validated.

## Hook API Contract

### Function Signature
```typescript
function useFollow(): UseMutationResult<
  { message: string },
  Error,
  { userId: string; isFollowing: boolean },
  unknown
>
```

### Parameters
- **mutationFn parameters**: `{ userId: string; isFollowing: boolean }`
  - `userId`: ID of the user to follow/unfollow
  - `isFollowing`: Current follow state (true = unfollow, false = follow)

### Return Value
Returns a React Query `UseMutationResult` with:
- `mutate`: Function to trigger follow/unfollow
- `isPending`: Loading state
- `isError`: Error state
- `error`: Error details if mutation fails
- `isSuccess`: Success state
- `data`: Response data from successful mutation

## Test Specifications

### 1. Follow Operation
**Test Case**: Should call follow API when isFollowing is false
- **Given**: User is not following the target user (`isFollowing: false`)
- **When**: `mutate({ userId: "user-123", isFollowing: false })` is called
- **Then**: Should make POST request to `/api/users/user-123/follow`
- **And**: Should include credentials in request
- **And**: Should return success message on 201 response

### 2. Unfollow Operation
**Test Case**: Should call unfollow API when isFollowing is true
- **Given**: User is following the target user (`isFollowing: true`)
- **When**: `mutate({ userId: "user-123", isFollowing: true })` is called
- **Then**: Should make DELETE request to `/api/users/user-123/follow`
- **And**: Should include credentials in request
- **And**: Should return success message on 200 response

### 3. Loading States
**Test Case**: Should manage loading state correctly
- **Given**: Hook is in idle state
- **When**: Mutation is triggered
- **Then**: `isPending` should be true during API call
- **And**: `isPending` should be false after completion
- **And**: Component should show loading indicators while `isPending` is true

### 4. Error Handling
**Test Case**: Should handle API errors gracefully
- **Given**: Server returns error response (4xx or 5xx)
- **When**: Follow/unfollow mutation is attempted
- **Then**: `isError` should be true
- **And**: `error` should contain error details
- **And**: Loading state should be reset
- **And**: User should see appropriate error message

### 5. Query Invalidation
**Test Case**: Should invalidate related queries on success
- **Given**: Successful follow/unfollow operation
- **When**: Mutation completes successfully
- **Then**: Should invalidate queries with key `["users"]`
- **And**: Should invalidate queries with key `["user"]`
- **And**: Updated follower counts should be refetched
- **And**: Follow status should be updated in cache

### 6. Network Errors
**Test Case**: Should handle network connectivity issues
- **Given**: Network is unavailable or request fails
- **When**: API request is made
- **Then**: Should catch network errors
- **And**: Should set appropriate error state
- **And**: Should not update cache with stale data

### 7. Concurrent Mutations
**Test Case**: Should handle multiple simultaneous mutations
- **Given**: Multiple follow/unfollow operations triggered rapidly
- **When**: User clicks follow button multiple times quickly
- **Then**: Should prevent duplicate API calls
- **And**: Should maintain consistent state
- **And**: Should complete all operations in correct order

### 8. Authentication Requirements
**Test Case**: Should include authentication credentials
- **Given**: User is authenticated
- **When**: Any follow/unfollow operation is performed
- **Then**: Request should include session cookies
- **And**: Should handle 401 responses appropriately
- **And**: Should not attempt unauthenticated requests

## Integration Points

### With FollowButton Component
- Hook should be consumed by FollowButton component
- Loading state should disable button and show spinner
- Error state should be displayed to user
- Success should trigger optimistic UI updates

### With React Query
- Hook should use `useMutation` from React Query
- Should integrate with global query cache
- Should follow React Query error handling patterns
- Should support retry policies for failed requests

### With API Layer
- Should use `followUser()` and `unfollowUser()` functions from `/lib/api.ts`
- Should maintain consistent error handling with other mutations
- Should follow same authentication patterns as existing hooks

## Manual Testing Scenarios

Since automated unit tests aren't available, these scenarios can be tested manually:

1. **Happy Path Testing**:
   - Test follow → unfollow → follow cycle
   - Verify UI updates correctly
   - Check network requests in DevTools

2. **Error Scenario Testing**:
   - Disconnect network and attempt follow
   - Test with invalid user IDs
   - Test with expired sessions

3. **Performance Testing**:
   - Rapid click testing (prevent duplicate requests)
   - Test with slow network connections
   - Memory leak testing with repeated operations

4. **Integration Testing**:
   - Test hook within FollowButton component
   - Test cache invalidation effects
   - Test with real backend API

## Expected API Responses

### Successful Follow (POST)
```json
{
  "message": "Successfully followed user"
}
```
Status: 201

### Successful Unfollow (DELETE)
```json
{
  "message": "Successfully unfollowed user"
}
```
Status: 200

### Error Responses
```json
{
  "error": "User not found"
}
```
Status: 404

```json
{
  "error": "Already following this user"
}
```
Status: 409

```json
{
  "error": "Cannot follow yourself"
}
```
Status: 400

## Implementation Notes

The hook is implemented in `/src/lib/queries.ts` and provides:
- Centralized follow/unfollow logic
- Automatic query invalidation
- Error handling consistent with other mutations
- Integration with React Query patterns
- TypeScript type safety

This specification serves as the test contract until unit testing infrastructure is added to the project.