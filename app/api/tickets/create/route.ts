import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDynamicWaitTime, calculatePriorityScore } from '@/lib/waitTimeEngine';
import { emitSocketEvent } from '@/lib/socketServer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      serviceId,
      type = 'WALK_IN',
      priority = 'REGULAR',
      scheduledTime,
    } = body;

    if (!customerName || !serviceId) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName and serviceId are required.' },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    // Generate Token Number (e.g. A-101)
    const ticketCount = await prisma.ticket.count({
      where: { serviceId },
    });

    const tokenNum = `${service.prefix}-${100 + ticketCount + 1}`;
    const priorityScore = calculatePriorityScore(priority, type === 'APPOINTMENT');

    // Create Ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: tokenNum,
        customerName,
        customerPhone,
        type,
        priority,
        status: 'WAITING',
        serviceId,
        priorityScore,
      },
      include: {
        service: true,
      },
    });

    // Handle Appointment association
    if (type === 'APPOINTMENT' && scheduledTime) {
      await prisma.appointment.create({
        data: {
          ticketId: ticket.id,
          scheduledTime: new Date(scheduledTime),
        },
      });
    }

    // Calculate initial EWT
    const ewt = await calculateDynamicWaitTime(serviceId, ticket.id, priority);
    
    // Update ticket with estimated wait
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { estimatedWait: ewt.estimatedWaitMinutes },
      include: { service: true, counter: true },
    });

    // Emit WebSocket Events
    emitSocketEvent('ticket:created', updatedTicket);
    emitSocketEvent('queue:updated', { serviceId, position: ewt.positionInQueue });

    return NextResponse.json(
      {
        success: true,
        ticket: updatedTicket,
        queueInfo: ewt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
