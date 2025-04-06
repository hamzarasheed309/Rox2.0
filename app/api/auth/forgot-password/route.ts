import { NextRequest, NextResponse } from 'next/server';
import { generatePasswordResetToken } from '@/lib/auth';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = forgotPasswordSchema.parse(body);
    
    // Generate password reset token
    await generatePasswordResetToken(validatedData.email);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    
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
        message: 'An error occurred while processing your request' 
      },
      { status: 500 }
    );
  }
} 