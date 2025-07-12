import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// POST /api/answers/[id]/vote - Vote on an answer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { voteType } = body;

    if (!voteType || !['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const answerId = params.id;

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if answer exists
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { author: true },
    });

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // Check if user is voting on their own answer
    if (answer.authorId === userProfile.id) {
      return NextResponse.json({ error: 'Cannot vote on your own answer' }, { status: 400 });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_answerId: {
          userId: userProfile.id,
          answerId: answerId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote
      if (existingVote.voteType === voteType) {
        // Remove vote if clicking the same button
        await prisma.vote.delete({
          where: {
            userId_answerId: {
              userId: userProfile.id,
              answerId: answerId,
            },
          },
        });
      } else {
        // Change vote type
        await prisma.vote.update({
          where: {
            userId_answerId: {
              userId: userProfile.id,
              answerId: answerId,
            },
          },
          data: {
            voteType: voteType,
          },
        });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          voteType: voteType,
          userId: userProfile.id,
          answerId: answerId,
        },
      });
    }

    // Get updated vote counts
    const votes = await prisma.vote.findMany({
      where: { answerId: answerId },
    });

    const upvotes = votes.filter(vote => vote.voteType === 'UPVOTE').length;
    const downvotes = votes.filter(vote => vote.voteType === 'DOWNVOTE').length;

    // Update answer vote counts
    await prisma.answer.update({
      where: { id: answerId },
      data: {
        upvotes: upvotes,
        downvotes: downvotes,
      },
    });

    return NextResponse.json({
      upvotes,
      downvotes,
      userVote: existingVote && existingVote.voteType === voteType ? null : voteType,
    });
  } catch (error) {
    console.error('Error voting on answer:', error);
    return NextResponse.json({ error: 'Failed to vote on answer' }, { status: 500 });
  }
} 