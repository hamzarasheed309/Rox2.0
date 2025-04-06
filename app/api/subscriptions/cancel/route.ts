import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated' 
        },
        { status: 401 }
      );
    }
    
    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: currentUser.id },
    });
    
    if (!subscription) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No active subscription found' 
        },
        { status: 404 }
      );
    }
    
    if (subscription.status === 'CANCELED') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Subscription is already canceled' 
        },
        { status: 400 }
      );
    }
    
    // TODO: Integrate with Stripe or other payment processor
    // This is a placeholder for the actual cancellation logic
    
    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: currentUser.id },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: true,
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Subscription canceled successfully',
        subscription: updatedSubscription
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cancel subscription error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while canceling your subscription' 
      },
      { status: 500 }
    );
  }
} 