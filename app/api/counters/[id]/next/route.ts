import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitSocketEvent } from '@/lib/socketServer';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const counterId = params.id;

    const counter = await prisma.counter.findUnique({
      where: { id: counterId },
      include: { service: true },
    });

    if (!counter) {
      return NextResponse.json({ error: 'Counter not found.' }, { status: 404 });
    }

    if (!counter.serviceId) {
      return NextResponse.json(
        { error: 'Counter is not currently assigned to any service.' },
        { status: 400 }
      );
    }

    // Find highest priority WAITING ticket for this counter's service
    const nextTicket = await prisma.ticket.findFirst({
      where: {
        serviceId: counter.serviceId,
        status: 'WAITING',
      },
      orderBy: [
        { priorityScore: 'desc' },
        { joinedAt: 'asc' },
      ],
      include: { service: true },
    });

    if (!nextTicket) {
      return NextResponse.json({
        success: false,
        message: 'No tickets waiting in queue for this service.',
      });
    }

    // Dispatch ticket to counter
    const updatedTicket = await prisma.ticket.update({
      where: { id: nextTicket.id },
      data: {
        status: 'CALLED',
        counterId: counter.id,
        calledAt: new Date(),
      },
      include: {
        service: true,
        counter: true,
      },
    });

    // Broadcast WebSocket events
    emitSocketEvent('ticket:called', {
      ticket: updatedTicket,
      counter,
      message: `Token ${updatedTicket.ticketNumber} called to ${counter.counterNumber}`,
    });

    emitSocketEvent('ticket:updated', updatedTicket, `ticket-${updatedTicket.id}`);
    emitSocketEvent('counter:state_changed', { counterId, currentTicket: updatedTicket });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      counter,
    });
  } catch (error: any) {
    console.error('Error in dispatching next ticket:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
