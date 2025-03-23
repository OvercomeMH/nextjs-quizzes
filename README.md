# QuizMaster Application

QuizMaster is a web application that allows users to take quizzes, track their progress, and compete with others.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env.local` file with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
4. Start the development server:
```bash
npm run dev
```

## Database

The application uses Supabase (PostgreSQL) as its database.

### Official Supabase Tools

These commands use the official Supabase CLI and tools for best results:

- **Setup Supabase CLI**: Install and configure the Supabase CLI
  ```bash
  npm run supabase:setup
  ```

- **Generate TypeScript Types**: Create types directly from your schema
  ```bash
  npm run supabase:types
  ```

- **Generate API Documentation**: Create API usage documentation
  ```bash
  npm run supabase:docs
  ```

- **Check Schema Changes**: See what's changed in your database
  ```bash
  npm run supabase:diff
  ```

- **Start Local Supabase**: Run Supabase locally for development
  ```bash
  npm run supabase:start
  ```

### Supabase Dashboard Tools

The Supabase Dashboard provides important tools for database management:

1. **Table Editor**: Visual interface to create and edit tables
   - Access at: [Supabase Dashboard > Table Editor](https://app.supabase.com/project/_/editor)

2. **API Documentation**: Auto-generated API docs for your tables
   - Access at: [Supabase Dashboard > API Docs](https://app.supabase.com/project/_/api)

3. **SQL Editor**: Run custom SQL queries
   - Access at: [Supabase Dashboard > SQL Editor](https://app.supabase.com/project/_/sql)

4. **Auth Management**: Configure authentication
   - Access at: [Supabase Dashboard > Authentication](https://app.supabase.com/project/_/auth)

### Legacy Custom Tools (Deprecated)

These are our custom tools that were created before using the official tools:

- **Test Database Access**: Check if your app can access all columns in all tables
  ```bash
  npm run test:db
  ```

- **Validate Database Schema**: Verify that your database tables are accessible
  ```bash
  npm run validate:db
  ```

- **Generate Database Documentation**: Create documentation files based on the current database schema
  ```bash
  npm run generate:db-docs
  ```

### Documentation Files

- `docs/supabase-api.md` - Auto-generated API documentation from Supabase
- `lib/database.types.ts` - Auto-generated TypeScript types from Supabase schema

## Testing

Run the full test suite with:
```bash
npm test
```

Or run specific tests:
```bash
# Run database access tests
npm run test:db

# Run tests in watch mode
npm run test:watch
```

## Building for Production

To build the application for production:
```bash
npm run build
```

Then start the production server:
```bash
npm start
```

## Features

- User authentication and profile management
- Browse and take quizzes
- View quiz results and statistics
- Track progress over time
- Admin tools for quiz management

## License

This project is licensed under the MIT License. 