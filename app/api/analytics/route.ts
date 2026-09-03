import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const totalTickets = await prisma.ticket.count();
    const completedTickets = await prisma.ticket.count({ where: { status: 'COMPLETED' } });
    const waitingTickets = await prisma.ticket.count({ where: { status: 'WAITING' } });
    const inServiceTickets = await prisma.ticket.count({
      where: { status: { in: ['CALLED', 'IN_SERVICE'] } },
    });
    const noShowTickets = await prisma.ticket.count({ where: { status: 'NO_SHOW' } });

    // Compute average handling time across all completed tickets
    const completedList = await prisma.ticket.findMany({
      where: {
        status: 'COMPLETED',
        calledAt: { not: null },
        completedAt: { not: null },
      },
    });

    let avgHandlingTimeMinutes = 0;
    if (completedList.length > 0) {
      const totalMs = completedList.reduce((acc, t) => {
        if (t.calledAt && t.completedAt) {
          return acc + (new Date(t.completedAt).getTime() - new Date(t.calledAt).getTime());
        }
        return acc;
      }, 0);
      avgHandlingTimeMinutes = Math.round(totalMs / (completedList.length * 60 * 1000));
    }

    // Breakdown per service
    const services = await prisma.service.findMany({
      include: {
        tickets: true,
      },
    });

    const serviceStats = services.map((s) => ({
      id: s.id,
      name: s.name,
      prefix: s.prefix,
      total: s.tickets.length,
      waiting: s.tickets.filter((t) => t.status === 'WAITING').length,
      completed: s.tickets.filter((t) => t.status === 'COMPLETED').length,
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalTickets,
        completedTickets,
        waitingTickets,
        inServiceTickets,
        noShowTickets,
        avgHandlingTimeMinutes,
      },
      serviceStats,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
