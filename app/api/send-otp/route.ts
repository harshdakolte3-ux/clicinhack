import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in global cache
    const globalAny = global as any;
    if (!globalAny.otpCache) globalAny.otpCache = {};
    globalAny.otpCache[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'harshdakolte27@gmail.com',
        pass: 'xwhx xpwg aosv qchy',
      },
    });

    const mailOptions = {
      from: '"Smart Queue" <harshdakolte27@gmail.com>',
      to: email,
      subject: 'Your Smart Queue OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Identity Verification</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for Identity Verification is:</p>
          <div style="font-size: 24px; font-weight: bold; padding: 10px 15px; background: #f3f4f6; display: inline-block; border-radius: 8px; letter-spacing: 2px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>Thank you,<br/>Smart Queue System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP email' }, { status: 500 });
  }
}
