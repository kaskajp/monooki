# Product Requirements Document

## Project Name
Monooki

## Objective
Build a self-hosted RESTful web service to help users store, organize, and manage their home inventory — items, locations (rooms), categories, and photos.

## Accounts
- Each account is associated with a "workspace"
- Each workspace can have multiple users
- Users can either be "admin" or "user"
- A workspace must have at least one admin
- Users must be able to log in securely.

## Features
### User Authentication
- Register, Login, Logout, Password Reset
- Token-based session (JWT or equivalent)

### Item Management
- Create, Read, Update, Delete (CRUD) items
- Items have: ID (required, auto-generated), Name (required), Description, Location (room), Category, Quantity, Photos, Model Number, Serial Number, Purchase Date, Purchase Price, Purchase Location, Warranty, Attachments, Custom Fields.
- Store photos securely in local storage, not cloud storage.
- Photos are associated with an item.
- Items can have an expiration date.
- Show number of items that are expiring soon (within 30 days) on the dashboard.
- Show expiration date on the item page and list pages.
- Sort by expiration date.

### Location Management
- CRUD for Locations (e.g., “Kitchen”, “Garage”, “Bedroom”).
- Locations have: ID (required, auto-generated), Name (required), Description.

### Category Management
- CRUD for Categories (e.g., “Electronics”, “Furniture”).
- Categories have: ID (required, auto-generated), Name (required).

### Search & Filter
- Search items by name, category, or location.
- Sort by id, name, purchase date, purchase price, or any other field/custom field.

### Command Center
- CMD+K to open the command center
- Search for items, locations, categories
- View all items, locations, categories
- Create new item, location, category

## API Endpoints

### Authentication
Method | Endpoint | Description
-------|----------|------------
POST | /api/register | Create user account
POST | /api/login | User login, return token
POST | /api/logout | Invalidate session/token
POST | /api/reset-password | Password reset request

### Items
Method | Endpoint | Description
-------|----------|------------
POST | /api/items | Create item
GET | /api/items | Get all items
GET | /api/items/{id} | Get item by id
PUT | /api/items/{id} | Update item by id
DELETE | /api/items/{id} | Delete item by id

### Locations
Method | Endpoint | Description
-------|----------|------------
POST | /api/locations | Create location
GET | /api/locations | Get all locations
GET | /api/locations/{id} | Get location by id
PUT | /api/locations/{id} | Update location by id
DELETE | /api/locations/{id} | Delete location by id

### Categories
Method | Endpoint | Description
-------|----------|------------
POST | /api/categories | Create category
GET | /api/categories | Get all categories
GET | /api/categories/{id} | Get category by id
PUT | /api/categories/{id} | Update category by id
DELETE | /api/categories/{id} | Delete category by id

## Non-Functional Requirements
- Use secure password hashing (bcrypt or equivalent)
- Use HTTPS for all endpoints
- Validate all input data
- Support JSON input/output only
- Use RESTful HTTP status codes
- Must be easy to deploy on a standard Linux server (e.g., Docker-ready)
- Use SQLite for the database
- Code must be modular and follow best practices for scalability

## Tech Stack
- Frontend: Lit, Vite, TypeScript
- Backend: Node.js, Express
- Database: SQLite
- Authentication: JWT
- Deployment: Docker Compose

## Design
- Take inspiration from Linear's design (https://linear.app/homepage)
- Use Space Grotesk font family
- Centralized design system with CSS custom properties
- Consistent dark theme with carefully chosen color palette
- Modern, clean interface with smooth animations and transitions
- Custom SVG icons for buttons and other UI elements (Nucleo Icons)

## Documentation
- README.md
- API documentation
- Deployment instructions
- Tech stack documentation
- License
- Contributing guidelines
- Code of conduct