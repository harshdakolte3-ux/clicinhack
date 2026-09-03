import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      include: {
        organization: true,
        _count: {
          select: {
            tickets: {
              where: { status: 'WAITING' },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      services: services.map((s) => ({
        ...s,
        waitingTicketsCount: s._count.tickets,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
