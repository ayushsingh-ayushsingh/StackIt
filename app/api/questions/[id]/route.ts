import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET /api/questions/[id] - Get a specific question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const questionId = (await params).id;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Transform the data to match the expected format
    const transformedQuestion = {
      id: question.id,
      title: question.title,
      description: question.description,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      author: question.author,
      tags: question.tags.map(qt => ({
        id: qt.tag.id,
        name: qt.tag.name,
      })),
      answerCount: question._count.answers,
      acceptedAnswerId: question.acceptedAnswerId,
    };

    return NextResponse.json(transformedQuestion);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}
