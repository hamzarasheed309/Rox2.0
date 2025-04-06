import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Logout user
    await logoutUser();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Logout successful' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during logout' 
      },
      { status: 500 }
    );
  }
} 