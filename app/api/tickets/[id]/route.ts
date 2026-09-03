import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDynamicWaitTime } from '@/lib/waitTimeEngine';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        service: true,
        counter: true,
        appointment: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    let queueInfo = null;
    if (ticket.status === 'WAITING') {
      queueInfo = await calculateDynamicWaitTime(ticket.serviceId, ticket.id, ticket.priority);
    }

    return NextResponse.json({
      success: true,
      ticket,
      queueInfo,
    });
  } catch (error: any) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
