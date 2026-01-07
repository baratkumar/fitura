# Fitura

A modern, beautiful web application built with Next.js, React, TypeScript, and PostgreSQL.

## Features

- 🚀 Fast and efficient Next.js 14 with App Router
- 🎨 Modern, responsive UI with Tailwind CSS
- 📱 Mobile-friendly design
- 🔒 Type-safe with TypeScript
- 🛠️ RESTful API routes
- 🗄️ PostgreSQL database integration
- ✨ Beautiful user interface

## Prerequisites

- Node.js 18.17 or higher
- PostgreSQL 12 or higher
- npm, yarn, or pnpm

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up PostgreSQL Database

1. Create a PostgreSQL database:
```bash
createdb fitura
# or using psql
psql -U postgres
CREATE DATABASE fitura;
```

2. Create a `.env.local` file in the root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitura
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 3. Initialize Database

Run the database initialization endpoint (this will create tables and insert default data):

```bash
# Start the dev server first
npm run dev

# Then in another terminal, run:
curl http://localhost:3000/api/init-db
```

Or visit `http://localhost:3000/api/init-db` in your browser.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
fitura/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── clients/       # Client API endpoints
│   │   ├── memberships/   # Membership API endpoints
│   │   └── init-db/       # Database initialization
│   ├── clients/           # Client pages
│   ├── settings/          # Settings page
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Footer.tsx
│   └── Navbar.tsx
├── lib/                   # Utility functions
│   ├── db.ts              # Database connection
│   ├── clientStore.ts     # Client data operations
│   ├── clientStore.types.ts # Client types
│   └── membershipStore.ts # Membership data operations
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Database Schema

### Memberships Table
- `id` - Primary key
- `name` - Membership name (unique)
- `description` - Membership description
- `duration_days` - Duration in days
- `price` - Membership price
- `is_active` - Active status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Clients Table
- `id` - Primary key
- `first_name` - Client first name
- `last_name` - Client last name
- `email` - Email address
- `phone` - Phone number
- `date_of_birth` - Date of birth
- `age` - Age
- `height` - Height in cm
- `weight` - Weight in kg
- `gender` - Gender (male/female/other)
- `aadhar_number` - Aadhar number
- `address` - Address
- `membership_type` - Foreign key to memberships table
- `emergency_contact_name` - Emergency contact name
- `emergency_contact_phone` - Emergency contact phone
- `medical_conditions` - Medical conditions
- `fitness_goals` - Fitness goals
- `first_time_in_gym` - First time in gym (yes/no)
- `previous_gym_details` - Previous gym experience details
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create a new client
- `GET /api/clients/[id]` - Get a specific client
- `PUT /api/clients/[id]` - Update a client
- `DELETE /api/clients/[id]` - Delete a client

### Memberships
- `GET /api/memberships` - Get all active memberships
- `GET /api/memberships?includeInactive=true` - Get all memberships including inactive
- `POST /api/memberships` - Create a new membership
- `GET /api/memberships/[id]` - Get a specific membership
- `PUT /api/memberships/[id]` - Update a membership
- `DELETE /api/memberships/[id]` - Delete a membership

### Database
- `GET /api/init-db` - Initialize database tables and default data

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js

## License

This project is open source and available for use.

## Contributing

Feel free to submit issues and enhancement requests!
