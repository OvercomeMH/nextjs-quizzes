# Migrating to Official Supabase Tools

This document explains why and how we are switching from custom database tools to official Supabase tooling.

## Why Use Official Supabase Tools?

1. **Maintained by Supabase**: Official tools are updated and tested by the Supabase team
2. **Better Integration**: Official tools work directly with Supabase's systems
3. **More Features**: Official tools provide a richer set of features
4. **Less Custom Code**: Fewer custom scripts to maintain ourselves

## Key Supabase Tools

### Supabase CLI

The [Supabase CLI](https://supabase.com/docs/reference/cli/introduction) is a powerful command-line tool that offers:

- Type generation
- Database migrations
- Local development
- Schema diffing
- And much more

### Type Generation

Instead of manually maintaining TypeScript types and validating them, Supabase can generate them directly:

```bash
# Using our wrapper script
npm run supabase:types

# Or directly with Supabase CLI
supabase gen types typescript --project-ref YOUR_PROJECT_REF --schema public > lib/database.types.ts
```

This ensures your types are always in sync with your database schema.

### Database Migrations

Supabase CLI provides robust migration tools:

```bash
# Generate a migration for schema changes
supabase db diff -f migration-name

# Apply migrations to your database
supabase db push
```

### Schema Visualization

The [Supabase Dashboard](https://app.supabase.com) provides a visual Table Editor that shows:

- Table structures with all columns
- Relationships
- Indexes
- Foreign keys
- And more

This visual interface is often more helpful than markdown documentation.

### API Documentation

Supabase auto-generates API documentation for your database:

1. Go to [Project Dashboard](https://app.supabase.com) > API Docs
2. See examples for all CRUD operations on your tables
3. Filter by table or function

## How to Switch from Custom Tools

### Step 1: Set Up Supabase CLI

```bash
npm run supabase:setup
```

This will:
- Install the Supabase CLI if needed
- Log you in to Supabase
- Link your project

### Step 2: Generate Types

```bash
npm run supabase:types
```

This will create `lib/database.types.ts` with accurate types from your database. Then update your code to use these types:

```typescript
// Old approach
import { Tables } from '../lib/supabase';

// New approach
import { Database } from '../lib/database.types';
type Tables = Database['public']['Tables'];
```

### Step 3: Generate API Documentation

```bash
npm run supabase:docs
```

This will create `docs/supabase-api.md` with examples for using your tables.

### Step 4: Use Supabase Dashboard

For schema visualization and management, use the Table Editor in your Supabase Dashboard:
- [Table Editor](https://app.supabase.com/project/_/editor)
- [API Docs](https://app.supabase.com/project/_/api)

## Examples

### Querying Data with Types

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Now you get full type checking and autocompletion
const { data, error } = await supabase
  .from('users')
  .select('*');

// TypeScript knows the shape of each user
if (data) {
  data.forEach(user => {
    console.log(user.username);
  });
}
```

## Legacy Custom Tools

Our custom tools are still available but considered deprecated:

- `npm run test:db` - Test database column access
- `npm run validate:db` - Verify table accessibility
- `npm run generate:db-docs` - Generate custom documentation

We recommend using the official Supabase tools for new development. 