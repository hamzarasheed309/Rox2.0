import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  currentPassword: z.string().min(1, 'Current password is required').optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').optional(),
});

export async function PUT(request: NextRequest) {
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
    const validatedData = updateUserSchema.parse(body);
    
    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.firstName) {
      updateData.firstName = validatedData.firstName;
    }
    
    if (validatedData.lastName) {
      updateData.lastName = validatedData.lastName;
    }
    
    // Handle password change if provided
    if (validatedData.currentPassword && validatedData.newPassword) {
      // Get user with password
      const userWithPassword = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { password: true },
      });
      
      if (!userWithPassword) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'User not found' 
          },
          { status: 404 }
        );
      }
      
      // Verify current password
      const { verifyPassword } = await import('@/lib/auth');
      const isValid = await verifyPassword(validatedData.currentPassword, userWithPassword.password);
      
      if (!isValid) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Current password is incorrect' 
          },
          { status: 400 }
        );
      }
      
      // Hash new password
      updateData.password = await hashPassword(validatedData.newPassword);
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        plan: true,
        emailVerified: true,
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Profile updated successfully',
        user: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    
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
        message: 'An error occurred while updating your profile' 
      },
      { status: 500 }
    );
  }
} 