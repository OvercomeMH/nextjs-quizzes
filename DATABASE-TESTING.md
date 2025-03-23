# Database Testing Guide

This document explains how to use our database testing tools to ensure data integrity and accessibility.

## Why Test Database Access?

Testing database access is critical for our application because:

1. It ensures our TypeScript types match the actual database schema
2. It catches permission issues early
3. It prevents bugs when database schema changes
4. It verifies all expected columns are accessible

## Available Testing Tools

We've created several tools to help test and validate the database:

### 1. Column Access Tests

The `tests/supabase-access.test.ts` file contains tests that verify we can access every column in every table.

**To run these tests:**
```bash
npm run test:db
```

This will:
- Connect to your Supabase database using credentials in `.env.local`
- Try to query each table
- Verify all columns defined in our types are accessible

### 2. Schema Validation

The `scripts/validate-db-schema.js` script checks if our TypeScript types match the actual database schema.

**To validate the schema:**
```bash
npm run validate:db
```

This will:
- Extract table and column definitions from our TypeScript types
- Query the actual database schema
- Report any tables or columns that exist in the database but are missing in our types

## When to Run These Tests

You should run these tests:

1. After making changes to the database schema
2. When updating the `lib/supabase.ts` type definitions
3. After a Supabase upgrade or migration
4. Before deploying to production
5. When experiencing unexpected data access issues

## Fixing Common Issues

### Missing Columns in Types

If `validate:db` reports missing columns:

1. Open `lib/supabase.ts`
2. Find the table definition that's missing columns
3. Add the missing columns with their appropriate types

### Permission Errors

If tests report permission errors:

1. Check your Supabase API key in `.env.local`
2. Verify Row Level Security (RLS) policies in Supabase
3. Make sure your account has proper permissions

### Empty Tables

Empty tables will show warnings but not errors. If you want to test column access more thoroughly, add some sample data to your tables.

## Continuous Integration

These tests are configured to run automatically in GitHub Actions when:
- The database type definitions change
- The tests themselves change
- A pull request is opened that affects related files

See `.github/workflows/database-tests.yml` for configuration details. 