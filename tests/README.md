# Database Test Suite

This directory contains tests for verifying that all aspects of our Supabase database are properly accessible and functioning.

## Database Column Access Tests

The `supabase-access.test.ts` file contains tests that verify we can access every column from all tables in our Supabase database. This is important to ensure:

1. Our database schema matches our TypeScript types
2. We have proper permissions to access all tables and columns
3. We detect any schema changes that might break our application

### How the Tests Work

For each table defined in our Supabase types (in `lib/supabase.ts`), the tests:

1. Query the table to get a sample row
2. Verify that all expected columns are present and accessible
3. Skip tests gracefully if tables are empty or if there are permission issues

### Running the Tests

You can run the database access tests in several ways:

**Run all tests:**
```
npm test
```

**Run just the database access tests:**
```
node tests/test-db-access.js
```

**Run tests in watch mode (for development):**
```
npm run test:watch
```

## Database Documentation

The tests work hand-in-hand with our database documentation to ensure consistency between the code and database. We have several documentation resources:

1. **Static Documentation**:
   - `DATABASE-SCHEMA.md` - Detailed schema documentation
   - `DATABASE-ERD.md` - Entity-Relationship Diagram
   - `DATABASE-ANALYTICS.md` - Analytics queries and patterns

2. **Auto-generated Documentation**:
   - `docs/db-schema.md` - Auto-generated from the current database
   - `docs/db-diagram.md` - Auto-generated ER diagram

You can update the auto-generated documentation by running:
```
npm run generate:db-docs
```

This will inspect your current database and create fresh documentation files.

## Troubleshooting

If the tests fail, check the following:

1. **Supabase Connection Issues:**
   - Verify your Supabase URL and key in `.env.local`
   - Check if Supabase service is online

2. **Schema Mismatch:**
   - If the error indicates missing columns, you may need to update your Types in `lib/supabase.ts`
   - Or you may need to update your Supabase database schema

3. **Permission Issues:**
   - Ensure your Supabase anon key has proper permissions to access all tables
   - Check Row Level Security (RLS) settings in Supabase

## Extending the Tests

To add tests for new tables or columns:

1. Add the table and column definitions to your Types in `lib/supabase.ts`
2. Add a new test section in `supabase-access.test.ts` for the new table
3. Run the tests to ensure everything is properly connected 