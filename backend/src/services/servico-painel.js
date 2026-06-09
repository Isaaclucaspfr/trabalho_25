import { prisma } from '../config/cliente-banco-dados.js';

export const dashboardService = {
  async metrics() {
    const [users, events, paidTickets, totals, topEvents] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.event.count({ where: { deletedAt: null } }),
      prisma.ticket.count({ where: { status: 'PAID' } }),
      prisma.ticket.aggregate({ where: { status: 'PAID' }, _sum: { totalValue: true } }),
      prisma.event.findMany({
        where: { deletedAt: null },
        include: { _count: { select: { tickets: true, favorites: true, views: true } } },
        orderBy: { tickets: { _count: 'desc' } },
        take: 5
      })
    ]);

    return {
      totalUsers: users,
      totalEvents: events,
      totalTicketsSold: paidTickets,
      totalRevenue: Number(totals._sum.totalValue || 0),
      topEvents,
      charts: {
        categories: await prisma.event.groupBy({ by: ['category'], _count: { _all: true } })
      }
    };
  }
};
