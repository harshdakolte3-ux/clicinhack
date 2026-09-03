import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Clear existing records
    await prisma.appointment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.counter.deleteMany();
    await prisma.service.deleteMany();
    await prisma.organization.deleteMany();

    // Create Organization
    const healthClinic = await prisma.organization.create({
      data: {
        name: 'City Care Super-Specialty Hospital',
        category: 'Healthcare',
      },
    });

    const opdService = await prisma.service.create({
      data: {
        organizationId: healthClinic.id,
        name: 'General Medicine OPD',
        prefix: 'A',
        avgServiceDuration: 8,
      },
    });

    const pediatricsService = await prisma.service.create({
      data: {
        organizationId: healthClinic.id,
        name: 'Pediatrics & Vaccination',
        prefix: 'B',
        avgServiceDuration: 12,
      },
    });

    const billingService = await prisma.service.create({
      data: {
        organizationId: healthClinic.id,
        name: 'Pharmacy & Billing',
        prefix: 'C',
        avgServiceDuration: 5,
      },
    });

    const counter1 = await prisma.counter.create({
      data: {
        organizationId: healthClinic.id,
        counterNumber: 'Counter 1',
        staffName: 'Dr. A. Sharma (OPD)',
        status: 'OPEN',
        serviceId: opdService.id,
      },
    });

    const counter2 = await prisma.counter.create({
      data: {
        organizationId: healthClinic.id,
        counterNumber: 'Counter 2',
        staffName: 'Dr. P. Verma (OPD)',
        status: 'OPEN',
        serviceId: opdService.id,
      },
    });

    const counter3 = await prisma.counter.create({
      data: {
        organizationId: healthClinic.id,
        counterNumber: 'Counter 3',
        staffName: 'Dr. R. Gupta (Pediatrics)',
        status: 'OPEN',
        serviceId: pediatricsService.id,
      },
    });

    const counter4 = await prisma.counter.create({
      data: {
        organizationId: healthClinic.id,
        counterNumber: 'Counter 4 (Pharmacy)',
        staffName: 'Pharmacist Sunita',
        status: 'OPEN',
        serviceId: billingService.id,
      },
    });

    await prisma.ticket.create({
      data: {
        ticketNumber: 'A-101',
        customerName: 'Rajesh Kumar',
        customerPhone: '+919876543210',
        type: 'WALK_IN',
        priority: 'SENIOR_CITIZEN',
        status: 'CALLED',
        serviceId: opdService.id,
        counterId: counter1.id,
        priorityScore: 200,
        calledAt: new Date(),
      },
    });

    await prisma.ticket.create({
      data: {
        ticketNumber: 'A-102',
        customerName: 'Ananya Sharma',
        customerPhone: '+919812345678',
        type: 'APPOINTMENT',
        priority: 'REGULAR',
        status: 'WAITING',
        serviceId: opdService.id,
        priorityScore: 100,
        estimatedWait: 5,
      },
    });

    await prisma.ticket.create({
      data: {
        ticketNumber: 'A-103',
        customerName: 'Vikram Singh',
        customerPhone: '+919988776655',
        type: 'WALK_IN',
        priority: 'EMERGENCY',
        status: 'WAITING',
        serviceId: opdService.id,
        priorityScore: 1000,
        estimatedWait: 2,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database reset and seeded with fresh demo data successfully!',
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
