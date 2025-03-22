import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test Supabase connection by fetching quizzes
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .limit(10)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: error
        }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      count: data?.length || 0,
      quizzes: data
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 
      { status: 500 }
    )
  }
} 