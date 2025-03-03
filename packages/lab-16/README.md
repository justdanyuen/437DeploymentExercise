Image Gallery SPA
This project is a Single Page Application (SPA) that allows users to browse an image gallery, view image details, and manage account settings. The website is built with React, React Router, and Vite to provide a smooth user experience without full-page reloads.

Features
Routing with React Router
- Users can navigate between different pages using React Router.
- The app includes paths for the homepage, image gallery, image details, and account settings.
Dynamic Image Details Pages
- Clicking an image in the gallery navigates to a details page using URL parameters (useParams).

Efficient SPA Navigation
- Uses <Link> instead of <a> tags to prevent full-page reloads.

Persistent Header with Checkbox
- The header remains visible across all pages.
- The checkbox state is preserved when navigating between pages by using React Router's nested routes.

Editable Account Name
- Users can change their account name in Account Settings, and it reflects on the homepage.
- The state is lifted to App.jsx so it persists across pages.

Optimized Image Data Fetching
- Images are fetched once and stored in state (App.jsx) to prevent unnecessary re-fetching when revisiting the gallery.

Tech Stack
- React for building components
- React Router for navigation
- Vite for fast development
- useState & useEffect for state management
- CSS for styling