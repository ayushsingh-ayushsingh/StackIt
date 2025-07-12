import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// POST /api/answers/[id]/accept - Accept an answer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const answerId = params.id;

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get answer with question details
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        question: {
          include: {
            author: true,
          },
        },
        author: true,
      },
    });

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // Check if user is the question owner
    if (answer.question.authorId !== userProfile.id) {
      return NextResponse.json({ error: 'Only the question owner can accept answers' }, { status: 403 });
    }

    // Check if answer is already accepted
    if (answer.question.acceptedAnswerId === answerId) {
      return NextResponse.json({ error: 'Answer is already accepted' }, { status: 400 });
    }

    // Update question to accept this answer
    await prisma.question.update({
      where: { id: answer.questionId },
      data: {
        acceptedAnswerId: answerId,
      },
    });

    // Create notification for answer author
    await prisma.notification.create({
      data: {
        type: 'ANSWER',
        message: `${userProfile.username} accepted your answer to "${answer.question.title}"`,
        userId: answer.authorId,
        referenceId: answerId,
      },
    });

    return NextResponse.json({ 
      message: 'Answer accepted successfully',
      acceptedAnswerId: answerId,
    });
  } catch (error) {
    console.error('Error accepting answer:', error);
    return NextResponse.json({ error: 'Failed to accept answer' }, { status: 500 });
  }
} 