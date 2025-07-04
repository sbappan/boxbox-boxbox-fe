## Relevant Files

- `src/lib/mock-data.ts` - To define the `Review` type and create mock review data.
- `src/components/` - This directory will house the new components for the review feature.
- `src/components/grand-prix-review-page.tsx` - The main component for the page, which will integrate the form and the list.
- `src/components/review-form.tsx` - The component for the review submission form.
- `src/components/review-list.tsx` - The component to display the list of reviews.
- `src/components/review-list-item.tsx` - The component for a single review item in the list.
- `src/App.tsx` - To integrate the new `GrandPrixReviewPage` component and display it.

### Notes

- We will follow a component-based architecture.
- For now, no unit tests are required, but we should structure the code to be testable in the future.

## Tasks

- [x] **1.0 Setup Data Structures and Mock Data**

  - [x] 1.1 Define a `Review` TypeScript type in `src/lib/mock-data.ts` that includes `author`, `avatarUrl`, `rating` (1-5), `text`, and `date`.
  - [x] 1.2 Create an array of mock `Review` objects in `src/lib/mock-data.ts`. Include 3-4 sample reviews for the "Austrian Grand Prix 2025".
  - [x] 1.3 Use `https://picsum.photos/200` for avatar URLs.

- [x] **2.0 Create Core Review Page Components**

  - [x] 2.1 Create a new file `src/components/grand-prix-review-page.tsx` for the main page component.
  - [x] 2.2 Inside `grand-prix-review-page.tsx`, import and render a `ReviewForm` and a `ReviewList` component.
  - [x] 2.3 Create the `src/components/review-form.tsx` file. It should contain a basic form structure with placeholders for name, review text, and rating.
  - [x] 2.4 Create the `src/components/review-list.tsx` file. It should accept a `reviews` prop and map over them to render `ReviewListItem` components.
  - [x] 2.5 Create the `src/components/review-list-item.tsx` file. This component will accept a single `review` object as a prop and display its details.
  - [x] 2.6 Update `src/App.tsx` to render the `GrandPrixReviewPage` component so it's visible.

- [x] **3.0 Implement Review Submission Logic**

  - [x] 3.1 In `grand-prix-review-page.tsx`, use the `useState` hook to manage the list of reviews, initializing it with the mock data.
  - [x] 3.2 Create a handler function in `grand-prix-review-page.tsx` that takes a new review object and adds it to the state.
  - [x] 3.3 Pass this handler function down as a prop to `review-form.tsx`.
  - [x] 3.4 In `review-form.tsx`, use `useState` to manage the form inputs (name, text, rating).
  - [x] 3.5 Implement the `onSubmit` handler for the form to create a new review object from the form state and call the submission handler from its props.
  - [x] 3.6 Ensure the new review is added to the top of the list.

- [x] **4.0 Display and Style Review List**

  - [x] 4.1 In `review-list-item.tsx`, lay out the review details: avatar, author name, date, star rating, and review text.
  - [x] 4.2 Implement the star rating display. This can be done by rendering a star icon multiple times based on the rating.
  - [x] 4.3 Apply basic styling to the review list and items using Tailwind CSS and shadcn/ui to ensure they are clearly separated and readable.

- [x] **5.0 Finalize Styling and Layout**
  - [x] 5.1 Style the `review-form.tsx` component using Tailwind CSS and shadcn/ui for a clean and user-friendly appearance.
  - [x] 5.2 Ensure the overall layout in `grand-prix-review-page.tsx` is a single column with the form at the top.
  - [x] 5.3 Verify that the entire page is responsive and looks good on both mobile and desktop screens.
