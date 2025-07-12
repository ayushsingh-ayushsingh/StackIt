import { NextResponse } from 'next/server';
import { generateAnswer } from '@/lib/LLM';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    if (question.trim().length < 3) {
      return NextResponse.json(
        { error: 'Question must be at least 3 characters long' },
        { status: 400 }
      );
    }

    const answer = await generateAnswer(question.trim());

    return NextResponse.json(answer);
  } catch (error) {
    console.error('Error in AI answer endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer' },
      { status: 500 }
    );
  }
} 