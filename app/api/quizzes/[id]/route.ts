import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import 'server-only';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params to fix the warning
    const { id: quizId } = await params;

    // Path to the quiz file
    const filePath = path.join(process.cwd(), 'data', 'quizzes', `${quizId}.json`);
    
    try {
      // Read the quiz file
      const fileContents = await fs.readFile(filePath, 'utf-8');
      const quizData = JSON.parse(fileContents);
      
      // Simulate a delay to mimic network latency
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return the quiz data
      return NextResponse.json(quizData);
    } catch (error) {
      console.error(`Quiz with ID ${quizId} not found:`, error);
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: "An error occurred while fetching the quiz" },
      { status: 500 }
    );
  }
} 