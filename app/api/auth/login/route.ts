import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email/Staff ID and Password are required.' },
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase();

    // 1. MASTER BILLING ADMIN LOGIN
    if (lowerEmail === 'billing@smartqueue.com') {
      if (password !== 'admin123' && password !== 'password123') {
        return NextResponse.json({ error: 'Invalid master password.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        message: 'Master Authentication successful.',
        user: {
          id: 'staff-master-billing',
          name: 'Master Billing Staff',
          email: lowerEmail,
          role: 'Admin Operator',
          counterNumber: 'Global Control'
        }
      });
    }

    // 2. DEPARTMENT OPERATOR LOGIN (Format: staff.<prefix>@smartqueue.com)
    if (lowerEmail.startsWith('staff.') && lowerEmail.includes('@')) {
      const prefix = lowerEmail.split('.')[1].split('@')[0].toUpperCase();
      
      const service = await prisma.service.findFirst({
        where: { prefix }
      });

      if (!service) {
        return NextResponse.json({ error: 'Department not found.' }, { status: 404 });
      }

      if (service.operatorPassword !== password) {
        return NextResponse.json({ error: 'Incorrect department password.' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        message: 'Authentication successful.',
        user: {
          id: `staff-${service.id}`,
          name: `${service.name} Operator`,
          email: lowerEmail,
          role: 'Counter Operator',
          counterNumber: `${service.name} Counter`,
          serviceId: service.id,
        }
      });
    }

    // Fallback for old demo logins
    return NextResponse.json({ error: 'Invalid staff email format.' }, { status: 400 });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Login failed.' }, { status: 500 });
  }
}
