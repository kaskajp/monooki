# Monooki - Home Inventory Management System

A self-hosted web application for managing your home inventory with support for items, locations, categories, and photos.

## Features

- **Multi-user workspaces** with admin and user roles
- **Item Management** - Track items with photos, locations, categories, and custom fields
- **Location Management** - Organize items by rooms or locations
- **Category Management** - Categorize items for easy organization
- **Search & Filter** - Find items by name, category, or location
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

- Node.js 18+ and npm
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

   This starts both backend (port 3000) and frontend (port 5173) servers.

6. **Open your browser**
   
   Navigate to http://localhost:5173

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

2. **Build and run manually**
   ```bash
   # Build the Docker image
   docker build -t monooki .
   
   # Run the container
   docker run -d \
     --name monooki \
     -p 3000:3000 \
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

### Items Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items (with search/filter) |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create new item |
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

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

The application uses SQLite with the following tables:

- **workspaces** - Multi-tenant workspaces
- **users** - User accounts with role-based access
- **items** - Inventory items with all tracking fields
- **locations** - Physical locations/rooms
- **categories** - Item categories
- **photos** - Photo attachments for items/locations
- **attachments** - File attachments for items

## Configuration

Key environment variables:

- `JWT_SECRET` - Secret key for JWT tokens (required)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DB_PATH` - SQLite database file path
- `FRONTEND_URL` - Frontend URL for CORS

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

- [ ] Mobile app support
- [ ] Import/export functionality
- [ ] Advanced reporting
- [ ] Barcode scanning
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Advanced search features
- [ ] Photo recognition/tagging