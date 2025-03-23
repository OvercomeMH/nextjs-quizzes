# Supabase API Documentation

> Auto-generated documentation for https://ndpicncmmttqjpgrbgfh.supabase.co

## Using Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ndpicncmmttqjpgrbgfh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
```

## Common Database Operations

### Selecting Data

```typescript
// Get all rows
const { data, error } = await supabase
  .from('table_name')
  .select('*')

// Get specific columns
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2, column3')

// Query with filters
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column_name', 'value')
```

### Inserting Data

```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert([
    { column1: 'value1', column2: 'value2' },
  ])
  .select()
```

### Updating Data

```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ column1: 'new_value' })
  .eq('id', 'some_id')
  .select()
```

### Deleting Data

```typescript
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', 'some_id')
```

### Joining Tables

```typescript
const { data, error } = await supabase
  .from('table1')
  .select(`
    *,
    table2 (*)
  `)
  .eq('table1.id', 'some_id')
```

## Additional Resources

- [Official Supabase Documentation](https://supabase.com/docs)
- [API Reference for JavaScript](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Dashboard](https://ndpicncmmttqjpgrbgfh.supabase.co)

For complete API reference, visit the [Supabase API Docs](https://ndpicncmmttqjpgrbgfh.supabase.co/project/api) in your project dashboard.
