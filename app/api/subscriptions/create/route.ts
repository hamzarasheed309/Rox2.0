import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  plan: z.enum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
});

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
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = createSubscriptionSchema.parse(body);
    
    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: currentUser.id },
    });
    
    if (existingSubscription) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User already has an active subscription' 
        },
        { status: 400 }
      );
    }
    
    // TODO: Integrate with Stripe or other payment processor
    // This is a placeholder for the actual payment processing logic
    
    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: currentUser.id,
        plan: validatedData.plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
    
    // Update user's plan
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { plan: validatedData.plan },
    });
    
    // Create billing record
    await prisma.billing.create({
      data: {
        userId: currentUser.id,
        amount: validatedData.plan === 'BASIC' ? 79 : 
                validatedData.plan === 'PROFESSIONAL' ? 199 : 479,
        status: 'SUCCEEDED',
        paymentMethod: validatedData.paymentMethodId,
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Subscription created successfully',
        subscription
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          errors: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while creating your subscription' 
      },
      { status: 500 }
    );
  }
} 