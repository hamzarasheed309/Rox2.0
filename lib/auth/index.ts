import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '../db';
import { userSchema } from '../db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const token = cookies().get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
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
  
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  
  return user;
}

export async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  plan?: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  
  if (existingUser) {
    throw new Error('Email already in use');
  }
  
  const hashedPassword = await hashPassword(data.password);
  
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      plan: data.plan || 'BASIC',
    },
  });
  
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    plan: user.plan,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  const token = generateToken(user.id);
  
  // Set cookie
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    plan: user.plan,
  };
}

export async function logoutUser() {
  cookies().delete('token');
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });
  
  if (!user) {
    throw new Error('Invalid or expired reset token');
  }
  
  const hashedPassword = await hashPassword(newPassword);
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });
  
  return true;
}

export async function generatePasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    // Don't reveal that the user doesn't exist
    return true;
  }
  
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // Token expires in 1 hour
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    },
  });
  
  // In a real application, you would send an email here
  console.log(`Password reset token for ${email}: ${token}`);
  
  return true;
} 