import { prisma } from './prisma';

export interface WaitTimeResult {
  estimatedWaitMinutes: number;
  positionInQueue: number;
  activeCountersCount: number;
  averageServiceMinutes: number;
}

/**
 * Dynamic EWT Engine: Calculates dynamic wait time based on actual counter speed,
 * active counters, priority level, and position in queue.
 */
export async function calculateDynamicWaitTime(
  serviceId: string,
  ticketId?: string,
  priority: string = 'REGULAR'
): Promise<WaitTimeResult> {
  // 1. Fetch Service details
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  const defaultAvgMinutes = service?.avgServiceDuration || 10;

  // 2. Compute dynamic AHT (Average Handling Time) from last 10 completed tickets
  const recentCompleted = await prisma.ticket.findMany({
    where: {
      serviceId,
      status: 'COMPLETED',
      calledAt: { not: null },
      completedAt: { not: null },
    },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });

  let dynamicAvgMinutes = defaultAvgMinutes;
  if (recentCompleted.length > 0) {
    const totalDurationMs = recentCompleted.reduce((acc, t) => {
      if (t.calledAt && t.completedAt) {
        return acc + (new Date(t.completedAt).getTime() - new Date(t.calledAt).getTime());
      }
      return acc;
    }, 0);

    const avgMinutesCalculated = Math.round(totalDurationMs / (recentCompleted.length * 60 * 1000));
    // Clamp between 2 mins and 60 mins for sanity
    dynamicAvgMinutes = Math.max(2, Math.min(60, avgMinutesCalculated || defaultAvgMinutes));
  }

  // 3. Get open counters assigned to this service
  const openCounters = await prisma.counter.count({
    where: {
      serviceId,
      status: 'OPEN',
    },
  });

  const effectiveCounters = Math.max(1, openCounters);

  // 4. Determine position in queue (tickets ahead with WAITING status)
  let position = 0;
  if (ticketId) {
    const targetTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (targetTicket) {
      position = await prisma.ticket.count({
        where: {
          serviceId,
          status: 'WAITING',
          OR: [
            { priorityScore: { gt: targetTicket.priorityScore } },
            {
              priorityScore: targetTicket.priorityScore,
              joinedAt: { lt: targetTicket.joinedAt },
            },
          ],
        },
      });
    }
  } else {
    // New ticket joining
    position = await prisma.ticket.count({
      where: {
        serviceId,
        status: 'WAITING',
      },
    });
  }

  // 5. Apply Priority Multiplier
  let priorityMultiplier = 1.0;
  if (priority === 'EMERGENCY') priorityMultiplier = 0.1;
  else if (priority === 'VIP') priorityMultiplier = 0.3;
  else if (priority === 'SENIOR_CITIZEN') priorityMultiplier = 0.5;

  // Formula: (Position * Dynamic AHT / Active Counters) * Priority Multiplier
  const estimatedWaitMinutes = Math.round((position * dynamicAvgMinutes / effectiveCounters) * priorityMultiplier);

  return {
    estimatedWaitMinutes: Math.max(0, estimatedWaitMinutes),
    positionInQueue: position + 1, // 1-indexed position
    activeCountersCount: effectiveCounters,
    averageServiceMinutes: dynamicAvgMinutes,
  };
}

/**
 * Calculates priority score for queue ordering.
 * Higher score = higher priority in queue.
 */
export function calculatePriorityScore(priority: string, isAppointment: boolean): number {
  let score = 0;
  if (priority === 'EMERGENCY') score += 1000;
  if (priority === 'VIP') score += 500;
  if (priority === 'SENIOR_CITIZEN') score += 200;
  if (isAppointment) score += 100;
  return score;
}
