import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitSocketEvent } from '@/lib/socketServer';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const body = await req.json();
    const { targetServiceId } = body;

    if (!targetServiceId) {
      return NextResponse.json({ error: 'Target service ID is required.' }, { status: 400 });
    }

    // Get current ticket
    const currentTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { service: true }
    });

    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    // Get target service
    const targetService = await prisma.service.findUnique({
      where: { id: targetServiceId }
    });

    if (!targetService) {
      return NextResponse.json({ error: 'Target service not found.' }, { status: 404 });
    }

    // Transfer the ticket to the new service
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        serviceId: targetServiceId,
        counterId: null, // Unassign from current counter
        status: 'WAITING',
        priorityScore: currentTicket.priorityScore + 100, // Boost priority slightly for transferred patients
      },
      include: {
        service: true,
        counter: true,
      }
    });

    // Emit real-time WebSocket events
    // 1. Notify the original counter that the ticket is gone (they transferred it)
    if (currentTicket.counterId) {
      emitSocketEvent('counter:state_changed', {
        counterId: currentTicket.counterId,
        currentTicket: null,
      });
    }

    // 2. Notify the old and new queues to refresh their waiting lists
    emitSocketEvent('queue:updated', { serviceId: currentTicket.serviceId });
    emitSocketEvent('queue:updated', { serviceId: targetServiceId });

    // 3. Notify the specific ticket to refresh its client view
    emitSocketEvent('ticket:updated', updatedTicket, `ticket-${ticketId}`);

    return NextResponse.json({ success: true, ticket: updatedTicket });

  } catch (error: any) {
    console.error('Transfer Ticket Error:', error);
    return NextResponse.json(
      { error: 'Failed to transfer ticket.' },
      { status: 500 }
    );
  }
}
