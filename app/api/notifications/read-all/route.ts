import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST(request: NextRequest) {
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

    // Update all unread notifications
    await prisma.notification.updateMany({
      where: {
        userId: userProfile.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
} 