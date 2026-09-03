import { NextRequest, NextResponse } from 'next/server';

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

    // Demo Authentication Validation Logic
    const demoUsers = [
      {
        id: 'staff-101',
        name: 'Dr. A. Sharma',
        email: 'dr.sharma@hospital.com',
        role: 'Counter Operator',
        counterNumber: 'Counter 1 (OPD)',
      },
      {
        id: 'staff-102',
        name: 'Dr. P. Verma',
        email: 'dr.verma@hospital.com',
        role: 'Counter Operator',
        counterNumber: 'Counter 2 (OPD)',
      },
      {
        id: 'staff-103',
        name: 'Pharmacist Sunita',
        email: 'sunita@hospital.com',
        role: 'Pharmacy Officer',
        counterNumber: 'Counter 4 (Pharmacy)',
      },
    ];

    const foundUser = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `staff-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: 'Staff Operator',
      counterNumber: 'Counter 1',
    };

    return NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user: foundUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed.' }, { status: 500 });
  }
}
