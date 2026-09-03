import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitSocketEvent } from '@/lib/socketServer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const body = await req.json();
    const { status, counterId } = body;

    const validStatuses = ['WAITING', 'CALLED', 'IN_SERVICE', 'COMPLETED', 'NO_SHOW', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const dataToUpdate: any = { status };
    if (counterId) dataToUpdate.counterId = counterId;
    if (status === 'COMPLETED') dataToUpdate.completedAt = new Date();
    if (status === 'CALLED' && !dataToUpdate.calledAt) dataToUpdate.calledAt = new Date();

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: dataToUpdate,
      include: {
        service: true,
        counter: true,
      },
    });

    // Emit real-time WebSocket events
    emitSocketEvent('ticket:updated', updatedTicket, `ticket-${ticketId}`);
    emitSocketEvent('queue:updated', { serviceId: updatedTicket.serviceId });

    if (status === 'CALLED' && updatedTicket.counter) {
      emitSocketEvent('ticket:called', {
        ticket: updatedTicket,
        counter: updatedTicket.counter,
        message: `Token ${updatedTicket.ticketNumber} called to ${updatedTicket.counter.counterNumber}`,
      });
    }

    if (updatedTicket.counterId) {
      emitSocketEvent('counter:state_changed', {
        counterId: updatedTicket.counterId,
        currentTicket: status === 'COMPLETED' || status === 'NO_SHOW' ? null : updatedTicket,
      });
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
