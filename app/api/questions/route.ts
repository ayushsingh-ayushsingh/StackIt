import { NextResponse } from 'next/server';
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
    const body = await request.json();
    const { title, description, tags } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // For now, we'll use a default author ID since we don't have authentication
    // In a real app, you'd get this from the authenticated user
    const defaultAuthorId = 'default-author-id'; // This should come from auth

    // Create the question
    const question = await prisma.question.create({
      data: {
        title: title.trim(),
        description: description,
        authorId: defaultAuthorId,
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

  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
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
