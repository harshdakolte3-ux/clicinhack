import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const counterId = params.id;
    await prisma.counter.delete({
      where: { id: counterId },
    });
    return NextResponse.json({ success: true, message: 'Counter deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting counter:', error);
    return NextResponse.json({ error: 'Failed to delete counter.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const counterId = params.id;
    const body = await req.json();
    
    const updated = await prisma.counter.update({
      where: { id: counterId },
      data: body,
      include: { service: true }
    });
    
    // Notify TV board and dashboards about the counter state change
    const { emitSocketEvent } = await import('@/lib/socketServer');
    emitSocketEvent('counter:state_changed', { counterId: updated.id });
    
    return NextResponse.json({ success: true, counter: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update counter.' }, { status: 500 });
  }
}
