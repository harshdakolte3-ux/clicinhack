import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const counters = await prisma.counter.findMany({
      include: {
        service: true,
        tickets: {
          where: {
            status: { in: ['CALLED', 'IN_SERVICE'] },
          },
          orderBy: { calledAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { counterNumber: 'asc' },
    });

    const formattedCounters = counters.map((c) => ({
      ...c,
      currentTicket: c.tickets[0] || null,
    }));

    return NextResponse.json({
      success: true,
      count: formattedCounters.length,
      counters: formattedCounters,
    });
  } catch (error: any) {
    console.error('Error fetching counters:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
