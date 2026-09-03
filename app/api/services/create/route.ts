import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, prefix, avgServiceDuration = 10, organizationId, operatorPassword } = body;

    if (!name || !prefix) {
      return NextResponse.json(
        { error: 'Service Name and Token Prefix are required.' },
        { status: 400 }
      );
    }

    // Get default organization if not provided
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      let org = await prisma.organization.findFirst();
      if (!org) {
        org = await prisma.organization.create({
          data: {
            name: 'City Service Facility Center',
            category: 'General Service',
          },
        });
      }
      targetOrgId = org.id;
    }

    const newService = await prisma.service.create({
      data: {
        organizationId: targetOrgId,
        name,
        prefix: prefix.toUpperCase(),
        avgServiceDuration: parseInt(avgServiceDuration, 10) || 10,
        operatorPassword: operatorPassword || 'password123',
      },
      include: {
        organization: true,
      },
    });

    // Automatically sync and create a Counter for this new department
    await prisma.counter.create({
      data: {
        organizationId: targetOrgId,
        counterNumber: `${newService.name} Counter`,
        serviceId: newService.id,
        status: 'OPEN'
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: `Service '${newService.name}' (Prefix ${newService.prefix}) created successfully!`,
        service: newService,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
