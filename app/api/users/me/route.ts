import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated' 
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          plan: user.plan,
          emailVerified: user.emailVerified,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user profile error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while fetching your profile' 
      },
      { status: 500 }
    );
  }
} 