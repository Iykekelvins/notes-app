# Notes API

A RESTful API for creating and managing notes with optional tags. Built with Node.js, Express, and TypeScript.

## Tech Stack

- **Runtime** — Node.js + TypeScript
- **Framework** — Express
- **Database** — PostgreSQL (Neon)
- **ORM** — Drizzle ORM
- **Validation** — Zod
- **Authentication** — JWT
- **Password hashing** — bcryptjs
- **Testing** — Vitest + Supertest

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Neon or local)

### Installation

```bash
git clone <your-repo-url>
cd notes-api
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
APP_STAGE=development
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5000,http://localhost:5173
NODE_ENV=development
```

For testing, create a `.env.test` file with a separate test database:

```env
PORT=5000
APP_STAGE=test
NODE_ENV=test
DATABASE_URL=postgresql://user:password@host/test_dbname?sslmode=require
JWT_SECRET=your_jwt_secret
```

### Database Setup

```bash
npm run db:push     # push schema to database
npm run db:seed     # seed demo data
```

### Running the Server

```bash
npm run dev         # development with hot reload
npm start           # production
```

---

## API Endpoints

### Health

| Method | Endpoint  | Auth | Description  |
| ------ | --------- | ---- | ------------ |
| GET    | `/health` | No   | Health check |

### Auth

| Method | Endpoint             | Auth | Description               |
| ------ | -------------------- | ---- | ------------------------- |
| POST   | `/api/auth/register` | No   | Register a new user       |
| POST   | `/api/auth/login`    | No   | Login and receive a token |
| POST   | `/api/auth/logout`   | Yes  | Logout current user       |

### Users

| Method | Endpoint              | Auth | Description          |
| ------ | --------------------- | ---- | -------------------- |
| GET    | `/api/users/profle`   | Yes  | Get current user     |
| PUT    | `/api/users/profle`   | Yes  | Update current user  |
| PUT    | `/api/users/password` | Yes  | Change user password |

### Notes

| Method | Endpoint         | Auth | Description        |
| ------ | ---------------- | ---- | ------------------ |
| GET    | `/api/notes`     | Yes  | Get all user notes |
| POST   | `/api/notes`     | Yes  | Create a note      |
| GET    | `/api/notes/:id` | Yes  | Get a single note  |
| PUT    | `/api/notes/:id` | Yes  | Update a note      |
| DELETE | `/api/notes/:id` | Yes  | Delete a note      |

### Tags

| Method | Endpoint        | Auth | Description  |
| ------ | --------------- | ---- | ------------ |
| GET    | `/api/tags`     | Yes  | Get all tags |
| POST   | `/api/tags`     | Yes  | Create a tag |
| DELETE | `/api/tags/:id` | Yes  | Delete a tag |

---

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

Tokens are returned on register and login.

---

## Database Schema

- **users** — stores account credentials and profile info
- **notes** — belongs to a user, contains title and body
- **tags** — global tags shared across users
- **note_tags** — junction table linking notes to tags (many-to-many)

---

## Scripts

```bash
npm run dev              # start dev server
npm start                # start production server
npm test                 # run tests
npm run test:watch       # run tests in watch mode
npm run test:coverage    # run tests with coverage report
npm run db:push          # push schema to database
npm run db:migrate       # run migrations
npm run db:studio        # open Drizzle Studio
npm run db:seed          # seed demo data
```

---

## Testing

Tests cover database setup and all API route endpoints. Run against a separate test database defined in `.env.test`.

```bash
npm test
```

---

## Demo Credentials

After seeding the database:

```
Email: demo@noteapp.com
Password: demo123
```
