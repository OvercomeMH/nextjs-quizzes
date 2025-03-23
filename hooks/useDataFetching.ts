import useSWR from 'swr'
import { supabase } from "@/lib/supabase"
import type { TableRow } from "@/lib/supabase"

type TableName = 'quizzes' | 'questions' | 'question_possible_answers' | 'submissions' | 'users' | 'user_answers'

type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';

interface Filter {
  column: string;
  operator: FilterOperator;
  value: any;
}

interface UseDataFetchingProps<T extends TableName> {
  table: T;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filter?: Filter;
}

// Fetcher function for SWR
const fetcher = async <T extends TableName>(key: string): Promise<TableRow<T>[]> => {
  const [table, select, orderBy, filter] = key.split('|') as [TableName, string, string, string]
  let query = supabase
    .from(table)
    .select(select)
  
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
  
  const { data, error } = await query
  if (error) throw error
  return (data || []) as unknown as TableRow<T>[]
}

export function useDataFetching<T extends TableName>({ table, select = '*', orderBy, filter }: UseDataFetchingProps<T>) {
  // Create a unique key for SWR
  const key = `${table}|${select}|${orderBy ? `${orderBy.column}:${orderBy.ascending}` : ''}|${filter ? JSON.stringify(filter) : ''}`
  
  const { data, error, isLoading, mutate } = useSWR<TableRow<T>[]>(key, fetcher)

  return {
    data: data || [],
    loading: isLoading,
    error: error?.message || null,
    mutate // Expose mutate function for manual revalidation
  }
}