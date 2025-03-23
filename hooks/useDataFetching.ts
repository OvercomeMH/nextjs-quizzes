import useSWR from 'swr'
import { supabase } from "@/lib/supabase"
import type { TableRow } from "@/lib/supabase"
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Define all possible table names from the database
type TableName = keyof Database['public']['Tables']

type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';

interface Filter {
  column: string;
  operator: FilterOperator;
  value: any;
}

// Define the structure for a join
interface Join {
  table: TableName;
  on: string;  // The column to join on
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filter?: Filter;
}

// Define the structure for a relation (a join that returns a single item)
interface Relation {
  table: TableName;
  on: string;
  select?: string;
}

// Define the structure for a relation that returns multiple items
interface Relations {
  table: TableName;
  on: string;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filter?: Filter;
}

interface UseDataFetchingProps<T extends TableName> {
  table: T;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filter?: Filter;
  // Support for joins
  joins?: Join[];
  // Support for relations (single item)
  relations?: Relation[];
  // Support for relations (multiple items)
  relationsMany?: Relations[];
  // Data transformation function
  transform?: (data: any) => any;
  // SWR options
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  dedupingInterval?: number;
  errorRetryCount?: number;
}

// Helper type to get the return type of a query with joins
type QueryResult<T extends TableName, J extends Join[] = [], R extends Relation[] = [], RM extends Relations[] = []> = 
  Database['public']['Tables'][T]['Row'] & {
    [K in J[number]['table'] as `${K}`]: Database['public']['Tables'][K]['Row'][];
  } & {
    [K in R[number]['table'] as `${K}`]: Database['public']['Tables'][K]['Row'];
  } & {
    [K in RM[number]['table'] as `${K}`]: Database['public']['Tables'][K]['Row'][];
  };

// Fetcher function for SWR
const fetcher = async <T extends TableName, J extends Join[] = [], R extends Relation[] = [], RM extends Relations[] = []>(
  key: string
): Promise<QueryResult<T, J, R, RM>[]> => {
  const [table, select, orderBy, filter, joins, relations, relationsMany] = key.split('|') as [
    TableName,
    string,
    string,
    string,
    string,
    string,
    string
  ]
  
  console.log('Fetcher called with key:', key);
  console.log('Table:', table);
  console.log('Select:', select);
  console.log('OrderBy:', orderBy);
  console.log('Filter:', filter);
  console.log('Joins:', joins);
  console.log('Relations:', relations);
  console.log('RelationsMany:', relationsMany);
  
  let query = supabase
    .from(table)
    .select(select)
  
  // Add joins if specified
  if (joins) {
    const parsedJoins = JSON.parse(joins) as Join[]
    parsedJoins.forEach(join => {
      // Don't append select here, just add the join
      query = query.select(`${select}, ${join.table}(*)`) as any
    })
  }

  // Add relations if specified
  if (relations) {
    const parsedRelations = JSON.parse(relations) as Relation[]
    parsedRelations.forEach(relation => {
      // Don't append select here, just add the relation
      query = query.select(`${select}, ${relation.table}(*)`) as any
    })
  }

  // Add relationsMany if specified
  if (relationsMany) {
    const parsedRelationsMany = JSON.parse(relationsMany) as Relations[]
    parsedRelationsMany.forEach(relation => {
      // Don't append select here, just add the relation
      query = query.select(`${select}, ${relation.table}(*)`) as any
    })
  }

  if (orderBy) {
    const [column, ascending] = orderBy.split(':')
    query = query.order(column, { ascending: ascending === 'true' })
  }

  if (filter) {
    const { column, operator, value } = JSON.parse(filter)
    // Use type assertion to handle the query builder
    const filterQuery = query as any
    filterQuery[operator](column, value)
  }
  
  console.log('Final query parameters:', { table, select, orderBy, filter, joins, relations, relationsMany });
  
  const { data, error } = await query
  console.log('Query result:', { data, error });
  
  if (error) throw error
  return (data || []) as unknown as QueryResult<T, J, R, RM>[]
}

export function useDataFetching<
  T extends TableName,
  J extends Join[] = [],
  R extends Relation[] = [],
  RM extends Relations[] = []
>({ 
  table, 
  select = '*', 
  orderBy, 
  filter,
  joins,
  relations,
  relationsMany,
  transform,
  revalidateOnFocus = true,
  revalidateOnReconnect = true,
  refreshInterval = 0,
  dedupingInterval = 2000,
  errorRetryCount = 3
}: UseDataFetchingProps<T>) {
  // Create a unique key for SWR
  const key = [
    table,
    select,
    orderBy ? `${orderBy.column}:${orderBy.ascending}` : '',
    filter ? JSON.stringify(filter) : '',
    joins ? JSON.stringify(joins) : '',
    relations ? JSON.stringify(relations) : '',
    relationsMany ? JSON.stringify(relationsMany) : ''
  ].join('|')
  
  const { data, error, isLoading, mutate } = useSWR<QueryResult<T, J, R, RM>[]>(key, fetcher, {
    revalidateOnFocus,
    revalidateOnReconnect,
    refreshInterval,
    dedupingInterval,
    errorRetryCount
  })

  // Transform the data if a transform function is provided
  const transformedData = transform ? transform(data || []) : data

  return {
    data: transformedData || [],
    loading: isLoading,
    error: error?.message || null,
    mutate,
    updateData: (updater: (data: QueryResult<T, J, R, RM>[]) => QueryResult<T, J, R, RM>[]) => {
      if (!data) return
      mutate(updater(data), false)
    }
  }
}