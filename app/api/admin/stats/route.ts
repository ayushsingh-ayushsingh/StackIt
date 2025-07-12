import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET /api/admin/stats - Get admin statistics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile and check if admin
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!userProfile || userProfile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get statistics
    const [
      totalUsers,
      totalQuestions,
      totalAnswers,
      pendingQuestions,
      bannedUsers,
    ] = await Promise.all([
      prisma.userProfile.count(),
      prisma.question.count(),
      prisma.answer.count(),
      prisma.question.count({
        where: {
          // Add status field if you implement question moderation
          // status: 'PENDING',
        },
      }),
      prisma.userProfile.count({
        where: {
          // Add isBanned field if you implement user banning
          // isBanned: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalQuestions,
      totalAnswers,
      pendingQuestions,
      bannedUsers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
} 