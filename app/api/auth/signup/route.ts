import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, counterAssignment } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields (Name, Email, Password) are required.' },
        { status: 400 }
      );
    }

    const newUser = {
      id: `staff-${Date.now()}`,
      name,
      email,
      role: 'Counter Operator',
      counterNumber: counterAssignment || 'Counter 1',
    };

    return NextResponse.json({
      success: true,
      message: 'Staff account created successfully.',
      user: newUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Signup failed.' }, { status: 500 });
  }
}
