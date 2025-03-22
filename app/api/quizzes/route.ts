import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import 'server-only';

export async function GET() {
  try {
    // Path to the quizzes directory
    const quizzesDir = path.join(process.cwd(), 'data', 'quizzes');
    
    // Read all files in the quizzes directory
    const files = await fs.readdir(quizzesDir);
    
    // Filter for .json files and read their contents
    const quizFiles = files.filter(file => file.endsWith('.json'));
    
    // Read and parse each quiz file
    const quizzes = await Promise.all(
      quizFiles.map(async (file) => {
        const filePath = path.join(quizzesDir, file);
        const fileContents = await fs.readFile(filePath, 'utf-8');
        const quizData = JSON.parse(fileContents);
        
        // Return only the quiz metadata and basic info, not the questions
        return {
          id: quizData.id,
          title: quizData.title,
          description: quizData.description,
          difficulty: quizData.difficulty,
          timeLimit: quizData.timeLimit,
          totalQuestions: quizData.questions.length,
          metadata: quizData.metadata
        };
      })
    );
    
    // Simulate a delay to mimic network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return the list of quizzes
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: "An error occurred while fetching quizzes" },
      { status: 500 }
    );
  }
} 