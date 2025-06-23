# Monooki - Home Inventory Management System

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

A self-hosted web application for managing your home inventory with support for items, locations, categories, and photos.

## Features

- **Multi-user workspaces** with admin and user roles
- **Item Management** - Track items with photos, locations, categories, and custom fields
- **Location Management** - Organize items by rooms or locations
- **Category Management** - Categorize items for easy organization
- **Custom Fields** - Add custom attributes to track additional item information
- **Amazon Integration** - Parse Amazon URLs to auto-populate item details
- **Expiring Items** - Track and monitor items with expiration dates
- **Label Generation** - Automatic label ID generation for physical item tracking
- **Search & Filter** - Find items by name, category, location, or expiration status
- **Photo Storage** - Upload and manage photos locally (not cloud-based)
- **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- **RESTful API** - Clean API endpoints for all operations
- **Modern Frontend** - Built with Lit components and TypeScript

## Tech Stack

- **Frontend**: Lit, Vite, TypeScript
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Authentication**: JWT
- **Deployment**: Docker Compose

## Quick Start

### Prerequisites

- Node.js 20.8.1+ and npm 10.0.0+
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd monooki
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run migrate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts both backend (port 3010) and frontend (port 5175) servers.

6. **Open your browser**
   
   Navigate to http://localhost:5175

### Production Deployment with Docker

1. **Using Docker Compose (Recommended)**
   ```bash
   # Copy environment file
   cp env.example .env
   
   # Edit .env with production values
   # Set JWT_SECRET to a secure random string
   
   # Start the application
   docker-compose up -d
   ```

Upgrading to the latest version:
```bash
# Pull the latest changes (if using git)
git pull

# Rebuild with the new Dockerfile
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

2. **Build and run manually**
   ```bash
   # Build the Docker image
   docker build -t monooki .
   
   # Run the container
   docker run -d \
     --name monooki \
     -p 3010:3010 \
     -e JWT_SECRET=your-secret-key \
     -e NODE_ENV=production \
     -v monooki_data:/app/data \
     -v monooki_uploads:/app/uploads \
     monooki
   ```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create user account |
| POST | `/api/login` | User login |
| POST | `/api/logout` | User logout |
| POST | `/api/reset-password` | Password reset request |

### User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/workspace` | Update workspace settings |
| PUT | `/api/user/password` | Change user password |
| GET | `/api/user/label-settings` | Get label configuration |
| PUT | `/api/user/label-settings` | Update label configuration |
| GET | `/api/user/currency-settings` | Get currency settings |
| PUT | `/api/user/currency-settings` | Update currency settings |
| POST | `/api/user/preview-label` | Preview label format |
| DELETE | `/api/user/delete-account` | Delete user account |

### Items Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items (with search/filter) |
| GET | `/api/items/expiring` | Get items expiring within specified days |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create new item |
| POST | `/api/items/parse-amazon-url` | Parse Amazon URL for item details |
| POST | `/api/items/:itemId/add-downloaded-photos` | Add photos from Amazon parsing |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Locations Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | Get all locations |
| GET | `/api/locations/:id` | Get location by ID |
| POST | `/api/locations` | Create new location |
| PUT | `/api/locations/:id` | Update location |
| DELETE | `/api/locations/:id` | Delete location |

### Categories Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/:id` | Get category by ID |
| POST | `/api/categories` | Create new category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Custom Fields Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/custom-fields` | Get all custom fields |
| POST | `/api/custom-fields` | Create new custom field |
| PUT | `/api/custom-fields/:id` | Update custom field |
| DELETE | `/api/custom-fields/:id` | Delete custom field |

### Photos Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/photos/items/:itemId` | Upload photos for an item |
| GET | `/api/photos/items/:itemId` | Get photos for an item |
| DELETE | `/api/photos/:photoId` | Delete a photo |
| GET | `/api/photos/files/:filename` | Serve photo file |

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

The application uses SQLite with the following tables:

- **workspaces** - Multi-tenant workspaces with label configuration
- **users** - User accounts with role-based access
- **items** - Inventory items with all tracking fields including labels and expiration
- **locations** - Physical locations/rooms
- **categories** - Item categories
- **custom_fields** - Custom field definitions for items
- **photos** - Photo attachments for items/locations
- **attachments** - File attachments for items

## Configuration

Key environment variables:

### Required
- `JWT_SECRET` - Secret key for JWT tokens (required in production)

### Optional
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3010)
- `DB_PATH` - SQLite database file path (default: data/monooki.db)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5175)
- `JWT_EXPIRES_IN` - JWT token expiration (default: 7d)

### Email Configuration (Optional) - Not implemented yet
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `FROM_EMAIL` - From email address

### File Upload Configuration (Optional) - Not implemented yet
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 10MB)
- `ALLOWED_FILE_TYPES` - Comma-separated list of allowed MIME types

## Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Joi schema validation
- **Rate Limiting** - API rate limiting
- **CORS Protection** - Configurable CORS settings
- **Helmet Security** - Security headers

## Development

### Project Structure

```
monooki/
├── src/                    # Backend source
│   ├── database/          # Database connection and migrations
│   ├── routes/            # API route handlers
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── server.ts          # Main server file
├── frontend/              # Frontend source
│   ├── src/               # Frontend TypeScript
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker image definition
└── package.json          # Backend dependencies
```

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run setup` - Install all dependencies

### Adding New Features

1. **Backend**: Add routes in `src/routes/`
2. **Frontend**: Add components in `frontend/src/components/`
3. **Database**: Update schema in `src/database/migrate.ts`
4. **Types**: Add TypeScript interfaces in `src/types/`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the repository or contact the maintainers.

## Roadmap

- [ ] Import/export functionality
- [ ] Advanced reporting
- [ ] Barcode scanning
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Advanced search features
- [ ] Photo recognition/tagging