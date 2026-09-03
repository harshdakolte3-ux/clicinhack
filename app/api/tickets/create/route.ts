import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDynamicWaitTime, calculatePriorityScore } from '@/lib/waitTimeEngine';
import { emitSocketEvent } from '@/lib/socketServer';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
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

    // Send confirmation email
    let emailSent = false;
    if (customerEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'harshdakolte27@gmail.com',
            pass: 'xwhx xpwg aosv qchy',
          },
        });
        
        const dateStr = type === 'APPOINTMENT' && scheduledTime ? new Date(scheduledTime).toLocaleString() : 'Walk-in (Today)';

        const mailOptions = {
          from: '"Smart Queue" <harshdakolte27@gmail.com>',
          to: customerEmail,
          subject: 'Your Smart Queue Ticket is Confirmed!',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-top: 0;">Booking Confirmed!</h2>
              <p>Hello <strong>${customerName}</strong>,</p>
              <p>Your ticket has been successfully generated in our system.</p>
              
              <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 5px 0;"><strong>Ticket Number:</strong> <span style="font-size: 18px; color: #4f46e5; font-weight: bold;">${updatedTicket.ticketNumber}</span></p>
                <p style="margin: 5px 0;"><strong>Department / Doctor:</strong> ${service.name}</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${type === 'APPOINTMENT' ? 'Advance Appointment' : 'Walk-in Queue'}</p>
                <p style="margin: 5px 0;"><strong>Time/Date:</strong> ${dateStr}</p>
              </div>

              <p>Please keep an eye on the Live TV Board or listen for the voice announcement for your token number.</p>
              <p>Thank you,<br/><strong>Smart Queue Management</strong></p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (err) {
        console.error('Failed to send confirmation email', err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        ticket: updatedTicket,
        queueInfo: ewt,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
