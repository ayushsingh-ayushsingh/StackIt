import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET /api/answers - Get answers for a question
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const answers = await prisma.answer.findMany({
      where: {
        questionId: questionId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        votes: {
          select: {
            voteType: true,
            userId: true,
          },
        },
      },
      orderBy: [
        { upvotes: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    // Transform the data to include vote counts and user vote
    const transformedAnswers = answers.map(answer => {
      const upvotes = answer.votes.filter(vote => vote.voteType === 'UPVOTE').length;
      const downvotes = answer.votes.filter(vote => vote.voteType === 'DOWNVOTE').length;
      
      return {
        id: answer.id,
        content: answer.content,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        author: answer.author,
        upvotes,
        downvotes,
        votes: answer.votes, // Keep for client-side processing
      };
    });

    return NextResponse.json(transformedAnswers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
  }
}

// POST /api/answers - Create a new answer
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, content } = body;

    if (!questionId || !content) {
      return NextResponse.json({ error: 'Question ID and content are required' }, { status: 400 });
    }

    // Get or create user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { author: true },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Create the answer
    const answer = await prisma.answer.create({
      data: {
        content: content,
        authorId: userProfile.id,
        questionId: questionId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create notification for question author
    if (question.authorId !== userProfile.id) {
      await prisma.notification.create({
        data: {
          type: 'ANSWER',
          message: `${userProfile.username} answered your question "${question.title}"`,
          userId: question.authorId,
          referenceId: answer.id,
        },
      });
    }

    return NextResponse.json({
      id: answer.id,
      content: answer.content,
      createdAt: answer.createdAt,
      author: answer.author,
      upvotes: 0,
      downvotes: 0,
    });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
  }
} 