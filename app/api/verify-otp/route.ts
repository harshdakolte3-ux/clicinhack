import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    
    const globalAny = global as any;
    const cache = globalAny.otpCache?.[email];

    if (!cache) {
      return NextResponse.json({ error: 'No OTP requested for this email or it expired' }, { status: 400 });
    }

    if (Date.now() > cache.expiresAt) {
      delete globalAny.otpCache[email];
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    if (cache.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Success! Clear it
    delete globalAny.otpCache[email];

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
