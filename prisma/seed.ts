import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // Clear existing records
  await prisma.appointment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.counter.deleteMany();
  await prisma.service.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Create Organization (Clinic / Hospital)
  const healthClinic = await prisma.organization.create({
    data: {
      name: 'City Care Super-Specialty Hospital',
      category: 'Healthcare',
    },
  });

  // 2. Create Services
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

  // 3. Create Counters
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

  // 4. Seed Initial Tickets for Demo Queue State
  const t1 = await prisma.ticket.create({
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
      estimatedWait: 0,
      calledAt: new Date(),
    },
  });

  const t2 = await prisma.ticket.create({
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

  const t3 = await prisma.ticket.create({
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

  const t4 = await prisma.ticket.create({
    data: {
      ticketNumber: 'B-201',
      customerName: 'Pooja Mehta',
      customerPhone: '+919765432109',
      type: 'WALK_IN',
      priority: 'REGULAR',
      status: 'CALLED',
      serviceId: pediatricsService.id,
      counterId: counter3.id,
      priorityScore: 0,
      estimatedWait: 0,
      calledAt: new Date(),
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log(`Created Organization: ${healthClinic.name}`);
  console.log(`Created 3 Services, 4 Counters, and 4 Initial Tickets.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
