# ScholarSync Backend

GraphQL API for ScholarSync scholarship application platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Set up database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

- GraphQL API: `http://localhost:4000/graphql`
- Health check: `http://localhost:4000/health`

## Project Structure

```
src/
├── config/         # Configuration files
├── resolvers/      # GraphQL resolvers
├── models/         # Data models and types
├── middleware/     # Express middleware (auth, validation, etc.)
└── utils/          # Utility functions
prisma/
└── schema.prisma   # Database schema
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (DB GUI)
