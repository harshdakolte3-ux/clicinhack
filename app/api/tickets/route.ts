import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');
    const status = searchParams.get('status');
    const counterId = searchParams.get('counterId');

    const whereClause: any = {};
    if (serviceId) whereClause.serviceId = serviceId;
    if (status) whereClause.status = status;
    if (counterId) whereClause.counterId = counterId;

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        service: true,
        counter: true,
        appointment: true,
      },
      orderBy: [
        { priorityScore: 'desc' },
        { joinedAt: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error: any) {
    console.error('Error fetching tickets list:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
