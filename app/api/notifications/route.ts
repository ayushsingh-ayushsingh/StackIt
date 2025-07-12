import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 most recent
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userProfile.id,
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
} 