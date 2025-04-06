import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/auth';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = resetPasswordSchema.parse(body);
    
    // Reset password
    await resetPassword(validatedData.token, validatedData.password);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Password has been reset successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    
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
    
    if (error instanceof Error && error.message === 'Invalid or expired reset token') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired reset token' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while resetting your password' 
      },
      { status: 500 }
    );
  }
} 