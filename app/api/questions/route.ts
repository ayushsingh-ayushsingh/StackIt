import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build the where clause for search
    const whereClause: any = {};
    
    if (search.trim()) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive' // Case-insensitive search
          }
        },
        {
          author: {
            username: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          tags: {
            some: {
              tag: {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          }
        }
      ];
    }

    const questions = await prisma.question.findMany({
      take: limit,
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        answers: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            answers: true
          }
        }
      }
    });

    // Filter questions by description content if search term is provided
    let filteredQuestions = questions;
    if (search.trim()) {
      filteredQuestions = questions.filter(question => {
        // Extract text from the JSON description
        const descriptionText = extractTextFromJson(question.description);
        return descriptionText.toLowerCase().includes(search.toLowerCase());
      });
    }

    // Transform the data to flatten the structure
    const transformedQuestions = filteredQuestions.map(question => ({
      id: question.id,
      title: question.title,
      description: question.description,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      author: {
        id: question.author.id,
        username: question.author.username,
        avatarUrl: question.author.avatarUrl
      },
      tags: question.tags.map(qt => ({
        id: qt.tag.id,
        name: qt.tag.name
      })),
      answerCount: question._count.answers
    }));

    return NextResponse.json({
      questions: transformedQuestions,
      total: transformedQuestions.length,
      search: search
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, tags } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Get or create user profile for the authenticated user
    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId }
    });

    if (!userProfile) {
      // Create user profile if it doesn't exist
      userProfile = await prisma.userProfile.create({
        data: {
          clerkId: userId,
          username: `user_${userId.slice(0, 8)}`, // Generate a username from clerk ID
          role: 'USER',
        }
      });
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        title: title.trim(),
        description: description,
        authorId: userProfile.id,
        tags: {
          create: tags.map((tagId: string) => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    console.log('Question created successfully:', question.id);

    return NextResponse.json({
      message: 'Question created successfully',
      question: {
        id: question.id,
        title: question.title,
        description: question.description,
        createdAt: question.createdAt,
        author: question.author,
        tags: question.tags.map(qt => ({
          id: qt.tag.id,
          name: qt.tag.name
        }))
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating question:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid author or tag reference' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Question with this title already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create question. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper function to extract text from JSON description
function extractTextFromJson(content: any): string {
  if (typeof content === 'string') return content;
  
  if (content && typeof content === 'object') {
    if (content.content && Array.isArray(content.content)) {
      return content.content
        .map((node: any) => {
          if (node.type === 'paragraph' && node.content) {
            return node.content
              .map((textNode: any) => textNode.text || '')
              .join('');
          }
          return '';
        })
        .join(' ')
        .trim();
    }
    
    // Try to find text in nested objects
    const textParts: string[] = [];
    const extractText = (obj: any) => {
      if (typeof obj === 'string') {
        textParts.push(obj);
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(extractText);
      }
    };
    
    extractText(content);
    return textParts.join(' ');
  }
  
  return '';
}
