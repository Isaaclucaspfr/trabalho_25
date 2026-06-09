import { prisma } from '../config/cliente-banco-dados.js';

export const platformService = {
  async stats() {
    const [paid, allTickets, activeCities, firstEvent] = await Promise.all([
      prisma.ticket.aggregate({ where: { status: 'PAID' }, _sum: { quantity: true } }),
      prisma.ticket.aggregate({
        where: { status: { in: ['PAID', 'CANCELED', 'RESERVED', 'PENDING'] } },
        _sum: { quantity: true }
      }),
      prisma.location.findMany({
        where: { deletedAt: null, events: { some: { deletedAt: null, status: 'PUBLISHED' } } },
        distinct: ['city'],
        select: { city: true }
      }),
      prisma.event.findFirst({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } })
    ]);

    const totalTickets = allTickets._sum.quantity || 0;
    const canceled = await prisma.ticket.aggregate({ where: { status: 'CANCELED' }, _sum: { quantity: true } });
    const canceledQty = canceled._sum.quantity || 0;

    const uptimeRatio = totalTickets > 0 ? (1 - canceledQty / totalTickets) * 100 : 100;
    const activeDays = firstEvent ? Math.max(1, Math.floor((Date.now() - firstEvent.createdAt.getTime()) / 86400000)) : 0;

    return {
      totalTicketsSold: paid._sum.quantity || 0,
      citiesActive: activeCities.length,
      uptime: `${uptimeRatio.toFixed(2)}%`,
      activeDays
    };
  }
};

