import { artistRepository } from '../repositories/artistRepository.js';
import { prisma } from '../config/prisma.js';

const compactNumber = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace('.0', '')}K`;
  return `${value}`;
};

const pct = (current, previous) => {
  if (previous === 0 && current > 0) return 100;
  if (previous === 0 && current === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const artistService = {
  list: () => artistRepository.list(),
  byId: (id) => artistRepository.findById(id),
  create: (data) => artistRepository.create(data),
  update: (id, data) => artistRepository.update(id, data),
  delete: (id) => artistRepository.softDelete(id),

  async trending() {
    const artists = await prisma.artist.findMany({
      where: { deletedAt: null },
      include: {
        events: {
          include: {
            event: {
              include: {
                tickets: { select: { quantity: true, status: true, createdAt: true } },
                _count: { select: { favorites: true, views: true } }
              }
            }
          }
        }
      }
    });

    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prev30 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    return artists
      .map((artist) => {
        const eventList = artist.events.map((entry) => entry.event);
        const sold = eventList.reduce(
          (acc, event) =>
            acc +
            event.tickets
              .filter((ticket) => ticket.status === 'PAID')
              .reduce((sum, ticket) => sum + ticket.quantity, 0),
          0
        );
        const favorites = eventList.reduce((acc, event) => acc + event._count.favorites, 0);
        const views = eventList.reduce((acc, event) => acc + event._count.views, 0);

        const recentSales = eventList.reduce(
          (acc, event) =>
            acc +
            event.tickets
              .filter((ticket) => ticket.status === 'PAID' && ticket.createdAt >= last30)
              .reduce((sum, ticket) => sum + ticket.quantity, 0),
          0
        );

        const previousSales = eventList.reduce(
          (acc, event) =>
            acc +
            event.tickets
              .filter((ticket) => ticket.status === 'PAID' && ticket.createdAt >= prev30 && ticket.createdAt < last30)
              .reduce((sum, ticket) => sum + ticket.quantity, 0),
          0
        );

        const listenersRaw = Math.max(250_000, sold * 8500 + favorites * 4200 + views * 150);
        const changeValue = pct(recentSales, previousSales);
        const sign = changeValue >= 0 ? '+' : '';
        const score = sold * 0.6 + favorites * 0.25 + views * 0.15;
        const festivals = eventList
          .filter(
            (event) =>
              event.deletedAt === null &&
              event.status === 'PUBLISHED' &&
              event.category?.toLowerCase() === 'festival' &&
              new Date(event.eventDate) >= now
          )
          .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
          .slice(0, 4)
          .map((festival) => ({
            eventId: festival.id,
            title: festival.title,
            eventDate: festival.eventDate,
            time: festival.time
          }));

        return {
          id: artist.id,
          name: artist.name,
          genre: artist.musicGenre || 'Diversos',
          listeners: compactNumber(Math.round(listenersRaw)),
          change: `${sign}${changeValue.toFixed(1).replace('.0', '')}%`,
          image: artist.image || `https://picsum.photos/seed/${artist.id}/400/400`,
          festivals,
          score
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...artist }) => artist);
  }
};
