import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { counterNumber, serviceId } = body;

    if (!counterNumber) {
      return NextResponse.json({ error: 'Counter number is required.' }, { status: 400 });
    }

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'SmartQueue Facility', category: 'General' },
      });
    }

    const newCounter = await prisma.counter.create({
      data: {
        organizationId: org.id,
        counterNumber,
        serviceId: serviceId || null,
        status: 'OPEN',
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json({ success: true, counter: newCounter }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating counter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
