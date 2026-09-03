import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;

    const deleted = await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({
      success: true,
      message: `Service '${deleted.name}' deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete service.' }, { status: 500 });
  }
}
