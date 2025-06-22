# E-Commerce Admin Panel

A full-stack e-commerce admin panel for product management built with Angular and Node.js.

## Features

- ✅ Complete Product CRUD operations
- ✅ Multiple image upload per product
- ✅ SKU uniqueness validation
- ✅ Responsive design
- ✅ Real-time form validation
- ✅ Image storage with Supabase

## Tech Stack

### Frontend
- Angular 10
- TypeScript
- Reactive Forms
- Bootstrap-inspired CSS

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- TypeORM ORM
- Supabase Storage
- Multer for file handling

## Quick Start

### Prerequisites
- Node.js v14 or higher
- PostgreSQL installed and running
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/narrahul/Task.git
cd Task
```

2. **Setup Backend**

Navigate to backend folder:
```bash
cd backend
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
```
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=ecommerce_db

# Supabase (for image storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_STORAGE_BUCKET=product-images

# Frontend URL
FRONTEND_URL=http://localhost:4200
```

Build and start backend:
```bash
npm run build
npm start
```

3. **Setup Frontend**

Open new terminal and navigate to frontend:
```bash
cd frontend
npm install --force
```

For Windows users with Node.js v17+:
```bash
set NODE_OPTIONS=--openssl-legacy-provider
npm start
```

For Mac/Linux users with Node.js v17+:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

The application will open at `http://localhost:4200`

## Supabase Setup

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Storage section
4. Create bucket named `product-images`
5. Set bucket to public (toggle Public bucket option)
6. Go to Settings > API
7. Copy:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`  
   - service_role key → `SUPABASE_SERVICE_KEY`

## Database Setup

The application will automatically create the required tables on first run. Make sure PostgreSQL is running and you have created a database.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

## Project Structure

```
ecommerce-admin-panel/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & Supabase config
│   │   ├── controllers/    # Route handlers
│   │   ├── entities/       # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/  # Angular components
    │   │   ├── models/      # TypeScript interfaces
    │   │   └── services/    # API services
    │   └── environments/    # Environment configs
    ├── package.json
    └── angular.json
```

## Screenshots

### Product List
- View all products in a table
- Click on images to view in modal
- Edit or delete products

### Add/Edit Product
- Add SKU, name, and price
- Upload multiple product images
- Real-time validation
- Duplicate SKU prevention



**ng command not found**
- Run `npm start` instead of `ng serve`


## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License